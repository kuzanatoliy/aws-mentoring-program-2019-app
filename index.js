const http = require('http');
const express = require('express');
const AWS = require('aws-sdk');
const multer = require('multer');
const bodyParser = require('body-parser');

const { connection, modelList: { Image, Subscription } } = require('./src/models');

AWS.config.loadFromPath('./src/config/aws.config.json');

const s3 = new AWS.S3({ apiVersion: '2006-03-01' });
const sns = new AWS.SNS({ apiVersion: '2010-03-31' });

const app = express();

const server = http.createServer(app);

app.use(bodyParser.urlencoded({ extended: true }), bodyParser.json());

app.get('/random', async (req, res) => {
  try {
    const imageList = await Image.findAll();
    const { fileName } = imageList[Math.floor(Math.random() * imageList.length)].toJSON();
    const { ContentType, Body } = await s3.getObject({ Bucket: 'aws.mentoring.program', Key: fileName }).promise();
    res.type(ContentType).send(Body);
  } catch (error) {
    res.status(500).send(error);
  }
});

app.get('/:imageName', async (req, res, next) => {
  try {
    const image = await Image.findOne({
      where: { fileName: req.params.imageName },
      attributes: [ 'id', 'fileName' ],
    });
    if(!image) {
      return next();
    }
    const { fileName } = image.toJSON();
    const { ContentType, Body } = await s3.getObject({ Bucket: 'aws.mentoring.program', Key: fileName }).promise();
    res.type(ContentType).send(Body);
  } catch (error) {
    res.status(500).send(error);
  }
});

app.post('/subscribe', async (req, res, next) => {
  try {
    if(!req.body.email) {
      return next();
    }
    const { SubscriptionArn } = await sns.subscribe({
      Protocol: 'email',
      TopicArn: 'arn:aws:sns:us-east-2:964473949068:AWSMentoringProgramSNSTopic',
      Endpoint: req.body.email,
      ReturnSubscriptionArn: true,
    }).promise();
    await Subscription.findOrCreate({
      where: { email: req.body.email, subscription: SubscriptionArn },
      default: { email: req.body.email, subscription: SubscriptionArn },
    });
    res.send('Subscribed');
  } catch (error) {
    res.status(500).send(error);
  }
});

app.post('/unsubscribe', async (req, res, next) => {
  try {
    const { subscription } = await Subscription.findOne({
      where: { email: req.body.email },
      attributes: [ 'subscription' ],
    })
    if(!subscription) {
      return next();
    }
    await sns.unsubscribe({
      SubscriptionArn: subscription,
    }).promise();
    res.send('Unsubscribed');
  } catch (error) {
    res.status(500).send(error);
  }
});

const multerMiddleware = multer({ storage: multer.memoryStorage() }).single('image');

app.post('/', multerMiddleware, async (req, res) => {
  try {
    const { originalname, buffer, mimetype } = req.file;
    await s3.upload({
      ACL: 'public-read',
      Bucket: 'aws.mentoring.program',
      Key: originalname,
      Body: buffer,
      ContentType: mimetype,
    }).promise();
    await Image.findOrCreate({
      where: { fileName: originalname },
      default: { fileName: originalname },
    });
    result = await sns.publish({
      Subject: 'AwsMentoringProgram: new image',
      Message: `${ req.protocol }://${req.hostname }/${originalname}`,
      TargetArn: 'arn:aws:sns:us-east-2:964473949068:AWSMentoringProgramSNSTopic',
    }).promise();
    res.status(200).send('File was saved');
  } catch (error) {
    res.status(500).send(error);
  }
});

app.use((req, res) => {
  res.status(404).send(`Sorry, page ${ req.originalUrl } not founded`);
});

connection.sync().then(() => {
  server.listen('9000', () => {
    console.log('Application running on http://localhost:9000');
  });
});

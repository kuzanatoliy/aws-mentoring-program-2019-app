const http = require('http');
const express = require('express');
const multer = require('multer');
const bodyParser = require('body-parser');

const { s3Service, snsService } = require('./src/services');

const { connection, modelList: { Image, Subscription } } = require('./src/models');

const app = express();

const server = http.createServer(app);

app.use(bodyParser.urlencoded({ extended: true }), bodyParser.json());

app.get('/random', async (req, res) => {
  try {
    const imageList = await Image.findAll();
    const { fileName } = imageList[Math.floor(Math.random() * imageList.length)].toJSON();
    const { ContentType, Body } = await s3Service.getObject(fileName);
    res.status(200).type(ContentType).send(Body);
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
    const { ContentType, Body } = await s3Service.getObject(fileName);
    res.status(200).type(ContentType).send(Body);
  } catch (error) {
    res.status(500).send(error);
  }
});

app.post('/subscribe', async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      return next();
    }
    const { SubscriptionArn } = await snsService.subscribe(email);
    await Subscription.findOrCreate({
      where: { email, subscription: SubscriptionArn },
      default: { email, subscription: SubscriptionArn },
    });
    res.status(200).send('Subscribed');
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
    await Promise.all([
      snsService.unsubscribe(subscription),
      Subscription.delete({ where: { subscription } }),
    ]);
    res.status(200).send('Unsubscribed');
  } catch (error) {
    res.status(500).send(error);
  }
});

const multerMiddleware = multer({ storage: multer.memoryStorage() }).single('image');

app.post('/', multerMiddleware, async (req, res) => {
  try {
    await s3Service.pushObject(req.file);
    const { originalname } = req.file;
    await Image.findOrCreate({
      where: { fileName: originalname },
      default: { fileName: originalname },
    });
    const message = `${ req.protocol }://${req.hostname }/${originalname}`;
    await snsSerivce.pushMessage(message);
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

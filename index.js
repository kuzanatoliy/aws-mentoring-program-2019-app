const http = require('http');
const express = require('express');
const multer = require('multer');
const bodyParser = require('body-parser');

const {
  lambdaAwsService,
  s3AwsService,
  snsAwsService,
  imageDBService,
  subscriptionDBService,
} = require('./src/services');
const config = require('./src/config/app.config.json');
const { connection } = require('./src/models');

const app = express();

const server = http.createServer(app);

app.use(bodyParser.urlencoded({ extended: true }), bodyParser.json());

app.get('/subscribe', async (req, res) => {
  res.send(`
    <form method="post" action="/subscribe">
      <label>
        Subscribe email
        <input type="email" name="email"/>
        <input type="submit"/>
      </label>
    </form>
  `);
});

app.get('/unsubscribe', async (req, res) => {
  res.send(`
    <form method="post" action="/unsubscribe">
      <label>
        Unsubscribe email
        <input type="email" name="email"/>
        <input type="submit"/>
      </label>
    </form>
  `)
})

app.post('/subscribe', async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      return next();
    }
    const { SubscriptionArn } = await snsAwsService.subscribe(email);
    await subscriptionDBService.findOrCreate(email, SubscriptionArn);
    res.status(200).send('Subscribed');
  } catch (error) {
    res.status(500).send(error);
  }
});

app.post('/unsubscribe', async (req, res, next) => {
  try {
    const { subscription } = await subscriptionDBService.getByEmail(req.body.email);
    if (!subscription) {
      return next();
    }
    await Promise.all([
      snsAwsService.unsubscribe(subscription),
      subscriptionDBService.remove(subscription),
    ]);
    res.status(200).send('Unsubscribed');
  } catch (error) {
    res.status(500).send(error);
  }
});

app.get('/random', async (req, res) => {
  try {
    const imageList = await imageDBService.getList();
    const { fileName } = imageList[Math.floor(Math.random() * imageList.length)].toJSON();
    const { ContentType, Body } = await s3AwsService.getObject(fileName);
    res.status(200).type(ContentType).send(Body);
  } catch (error) {
    res.status(500).send(error);
  }
});

app.get('/:imageName', async (req, res, next) => {
  try {
    const image = await imageDBService.getByName(req.params.imageName);
    if(!image) {
      return next();
    }
    const { fileName } = image.toJSON();
    const { ContentType, Body } = await s3AwsService.getObject(fileName);
    res.status(200).type(ContentType).send(Body);
  } catch (error) {
    res.status(500).send(error);
  }
});

const multerMiddleware = multer({ storage: multer.memoryStorage() }).single('image');

app.post('/', multerMiddleware, async (req, res) => {
  try {
    await s3AwsService.pushObject(req.file);
    const { originalname } = req.file;
    await imageDBService.findOrCreate(originalname);
    const message = `${ config.protocol }://${ config.hostname }/${originalname}`;
    await snsAwsService.pushMessage(message);
    res.status(200).send('File was saved');
  } catch (error) {
    res.status(500).send(error);
  }
});

app.use((req, res) => {
  res.status(404).send(`Sorry, page ${ req.originalUrl } not founded`);
});

Promise.all([connection.sync(), lambdaAwsService.checkBucket()]).then(() => {
  server.listen('9000', () => {
    console.log('Application running on http://localhost:9000');
  });
});

const http = require('http');
const express = require('express');
const AWS = require('aws-sdk');
const multer = require('multer');

const { connection, modelList: { Image } } = require('./src/models');

AWS.config.loadFromPath('./src/config/aws.config.json');

const s3 = new AWS.S3({ apiVersion: '2006-03-01' });

const app = express();

const server = http.createServer(app);

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
    console.log(fileName);
    const { ContentType, Body } = await s3.getObject({ Bucket: 'aws.mentoring.program', Key: fileName }).promise();
    res.type(ContentType).send(Body);
  } catch (error) {
    res.status(500).send(error);
  }
});

const multerMiddleware = multer({ storage: multer.memoryStorage() }).single('image');

app.post('/', multerMiddleware, async (req, res) => {
  try {
    const { originalname, buffer } = req.file;
    await s3.upload({
      ACL: 'public-read',
      Bucket: 'aws.mentoring.program',
      Key: originalname,
      Body: buffer,
    }).promise();
    Image.findOrCreate({
      where: { fileName: originalname },
      default: { fileName: originalname },
    });
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

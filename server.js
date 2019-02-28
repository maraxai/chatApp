var express = require('express');
var app = express();
var server = app.listen(3000, () => {
 console.log('server is running on port', server.address().port);
});

app.use(express.static(__dirname));

var mongoose = require('mongoose');
var dbUrl ='mongodb://admin:admin@cluster0-shard-00-00-fgovz.mongodb.net:27017,cluster0-shard-00-01-fgovz.mongodb.net:27017,cluster0-shard-00-02-fgovz.mongodb.net:27017/chatappdb?ssl=true&replicaSet=Cluster0-shard-0&authSource=admin&retryWrites=true';
mongoose.connect(dbUrl, (err) => {
  console.log('mongodb connected', err);
});

var Message = mongoose.model('Message',{ name : String, message : String});
var bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

app.get('/messages', (req, res) => {
  Message.find({}, (err, messages) => {
    res.send(messages);
  });
});
console.log('line 32');

app.post('messages', (req, res) => {
  var message = new Message(req.body);
  message.save((err) => {
    if (err)
      sendStatus(500);
      res.sendStatus(200);
  });
});

var http = require('http').Server(app);
var io = require('socket.io')(http);

io.on('connection', () => {
  console.log('a user is connected');
});

app.post('/messages', (req, res) => {
  var message = new Message(req.body);
  message.save((err) =>{
    if(err)
      sendStatus(500);
    io.emit('message', req.body);
    res.sendStatus(200);
  });
});

const MongoClient = require('mongodb').MongoClient;
const uri = "mongodb://admin:admin@cluster0-shard-00-00-fgovz.mongodb.net:27017,cluster0-shard-00-01-fgovz.mongodb.net:27017,cluster0-shard-00-02-fgovz.mongodb.net:27017/chatappdb?ssl=true&replicaSet=Cluster0-shard-0&authSource=admin&retryWrites=true";
const client = new MongoClient(uri, { useNewUrlParser: true });
client.connect(err => {
  const collection = client.db("chatappdb").collection("messages");
  client.close();
});

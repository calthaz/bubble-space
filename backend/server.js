const mongoose = require("mongoose");
const express = require("express");
const bodyParser = require("body-parser");
const logger = require("morgan");
const Bubble = require("./data");
const env = 'development';
const config = require('./config')[env];
const clientURL = config.clientURL;
const API_PORT = 3001;
const app = express();
const router = express.Router();
const http = require('http').Server(app);
const io = require('socket.io')(http, {origins:clientURL});
io.origins(clientURL);
console.log("allowing connection from "+clientURL);
//io.set('origins', 'http://localhost:3000' );

// this is our MongoDB database
const dbRoute = config.databaseLink;

// connects our back end code with the database
mongoose.connect(
  dbRoute,
  { useNewUrlParser: true }
);

let db = mongoose.connection;

db.once("open", () => console.log("connected to the database"));

// checks if connection with the database is successful
db.on("error", console.error.bind(console, "MongoDB connection error:"));

// (optional) only made for logging and
// bodyParser, parses the request body to be a readable json format
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(logger("dev"));
//might not be related to socket issues so may be deleted later
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", clientURL);
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  res.header("Access-Control-Allow-Credentials", true);
  next();
});
//The value of the 'Access-Control-Allow-Credentials' header in the response is '' 
//which must be 'true' when the request's credentials mode is 'include'. 
//Origin 'http://localhost:3000' is therefore not allowed access. 
//The credentials mode of requests initiated by the XMLHttpRequest is controlled by the withCredentials attribute.

// this is our get method
// this method fetches all available data in our database
router.get("/getData", (req, res) => {
  Bubble.find((err, data) => {
    if (err) return res.json({ success: false, error: err });
    let bubbles = data.map(entry => {
      let b = {};
      b.id= entry.id;
      b.coord= entry.coord; 
      b.title= entry.title;
      b.date= entry.date;
      b.situation=entry.situation;
      b.thoughts= entry.thoughts;
      b.tags=entry.tags;
      return b;}) 
    return res.json({ success: true, data: data });
  });
});

// this is our update method
// this method overwrites existing data in our database
router.post("/updateData", (req, res) => {
  const { id, coord } = req.body;
  if ((!id && id !== 0) || coord===undefined || coord.length !== 2) {
    return res.json({
      success: false,
      error: "INVALID INPUTS"
    });
  }
  //bubble.id = id;
  let bubble = {};
  bubble.coord = coord;
  bubble.title = req.body.title;
  bubble.date = req.body.date;
  bubble.situation = req.body.situation;
  bubble.thoughts = req.body.thoughts;
  bubble.feelings = req.body.feelings;
  bubble.tags  = req.body.tags;
  bubble.active = req.body.active;
  Bubble.findOneAndUpdate({id:id}, bubble, err => { //condition should be an object
    if (err) return res.json({ success: false, error: err });
    return res.json({ success: true });
  });
});

// this is our delete method
// this method removes existing data in our database
router.delete("/deleteData", (req, res) => {
  const { id } = req.body;
  Bubble.findOneAndDelete({id:id}, err => {
    if (err) return res.json({ success: false, error: err });
    return res.json({ success: true });
  });
});

// this is our create methid
// this method adds new data in our database
router.post("/putData", (req, res) => {
  let bubble = new Bubble();

  const { id, coord } = req.body;

  if ((!id && id !== 0) || coord===undefined || coord.length !== 2) {
    return res.json({
      success: false,
      error: "INVALID INPUTS"
    });
  }
  bubble.id = id;
  bubble.coord = coord;
  bubble.title = req.body.title;
  bubble.date = req.body.date;
  bubble.situation = req.body.situation;
  bubble.thoughts = req.body.thoughts;
  bubble.feelings = req.body.feelings;
  bubble.tags  = req.body.tags;
  bubble.active = req.body.active;
  bubble.save(err => {
    if (err) return res.json({ success: false, error: err });
    return res.json({ success: true });
  });
});

// append /api for our http requests
app.use("/api", router);

// launch our backend into a port
http.listen(API_PORT, () => console.log(`LISTENING ON PORT ${API_PORT}`));
//I don't see any reason port 3000 shouldn't work. Seems like the main point of the solution you posted 
//a link to was that using app.listen doesn't work since socket.io can only get the requests from the http server, 
//since socket.io takes the server as its handler and not the express app. – saltthehash
io.on('connection', function(socket){
  console.log('a user connected');
  socket.on('disconnect', function(){
    console.log('user disconnected');
  });
  socket.on('addedToDB', (bubble)=>{
    io.emit('addToClients', bubble);
  });
  socket.on('updatedDB', (bubble)=>{
    io.emit('updateClients', bubble);
  });
  socket.on('deletedInDB', (id)=>{
    io.emit('deleteInClients', id);
  });
});

io.on('connection', (client) => {
  client.on('subscribeToTimer', (interval) => {
    console.log('client is subscribing to timer with interval ', interval);
    setInterval(() => {
      client.emit('timer', new Date());
    }, interval);
  });
  //client.on('error', function () {});
});
//idioten! events.js:183
      //throw er; // Unhandled 'error' event
      //^
//Error: listen EADDRINUSE :::3001
//io.listen(API_PORT+1);
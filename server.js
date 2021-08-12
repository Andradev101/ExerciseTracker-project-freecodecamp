const express = require('express')
const app = express()
const cors = require('cors')

const mySecret = process.env['MONGO_URI']
const mongoose = require('mongoose')
var bodyParser = require('body-parser')

app.use(bodyParser.urlencoded({extended: false}))
require('dotenv').config()
app.use(cors())
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

mongoose.connect(mySecret, {
  dbName : 'myFirstDatabase', 
  useNewUrlParser: true, 
  useUnifiedTopology: true 
});
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log("its working")
});
//db connected

const newUserSchema = new mongoose.Schema({
  username: String
})//creating a schema

const User = mongoose.model('User', newUserSchema);
//compiling it into a model

app.post('/api/users', (req, res) =>{
  const user = new User({username: req.body.username});
  //creating a new user with the request from the form on the body
  user.save(function (err, data) { //saving it [which assigns it an _id]
    if (err) return handleError(err);//if error return error
    res.json({//success
      username: data.username,
      _id: data._id
    })
  });
});
//FUCK YEAH IT FUCKING WORKED IMA FEKIN GENIUS
//HALLO

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
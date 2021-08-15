const express = require('express')
const app = express()
const cors = require('cors')

const mySecret = process.env['MONGO_URI']
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const Schema = mongoose.Schema;

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

//creating schemas
const newUserSchema = new Schema({
	//_id: String,
  	username: String
})
//compiling it into models
const User = mongoose.model('user', newUserSchema);

const newExerciseSchema = new Schema({
	//_id: String,
  	description: {type:String, required:true},
  	duration: {type:Number, required:true},
  	date: String,
  	username: {type: Schema.Types.ObjectId, ref: 'user'},
});

//compiling it into models
const Exercise = mongoose.model('exercise', newExerciseSchema);

app.post('/api/users', (req, res) =>{
  const user = new User({username: req.body.username});
  //creating a new user with the request from the form on the body
  user.save(function (err, data) { //saving it [which assigns it an _id]
    if (err) return console.log(err);//if error return error
    res.json({//success
      username: data.username,
      _id: data._id
    })
  });
});
//FUCK YEAH IT FUCKING WORKED IMA FEKIN GENIUS
app.get('/api/users', function (req, res) {
  User.find({}).select({__v: 0}).exec((err, data) => {
    if (err) console.error(err);
    res.json(data)
  })
})
//it was right from the beginning but i had wrong answers before, so i had to use User.deleteMany({}).exec((err, data) => {
//     if (err) console.error(err);
//   })
//to delete all the old inputs

//TO DO BELOW
app.post('/api/users/:_id/exercises', (req, res) =>{
	
  if(req.body.date == ""){
    var currentDate = new Date();
    req.body.date = currentDate.toDateString()
  }
  	const exercise = new Exercise({
		description: req.body.description,
		duration: req.body.duration,
		date: req.body.duration
	});
	
/* 	exercise.save((err, data) => {
		if (err) console.error(err);
		res.json({
			_id: data._id,
			description: data.description,
			duration: data.duration,
			date: data.date
		})
  	}); */

	var userId = '61188524f489c80284fe14cb';
	console.log(userId);
	
	User.findByIdAndUpdate(userId)
	.populate('username')
	.exec((err, data) =>{
		if (err) res.send(err)
		console.log(data)
	})
})

app.get('/clear', (req, res) =>{
	User.findById('61188524f489c80284fe14cb', (err, data) =>{
		res.json(data)
	})
	// User.deleteMany({}, function(err) { 
	// 	console.log('collection removed') 
	// });

	// Exercise.deleteMany({}, function(err) { 
	// 	console.log('collection removed') 
	// });
})

const listener = app.listen(process.env.PORT || 3000, () => {
	console.log('Your app is listening on port ' + listener.address().port)
})

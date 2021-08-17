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

const newUserSchema = new Schema({
  username: String
})
const User = mongoose.model('User', newUserSchema);

const newExerciseSchema = new Schema({
  description: {type:String, required:true},
  duration: {type:Number, required:true},
  date: { type: String, default: Date.now },
  username: {type: Schema.Types.ObjectId, ref: 'User', required: true},
});
const Exercise = mongoose.model('exercise', newExerciseSchema);

//ROUTES
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

app.post('/api/users', (req, res) =>{
  const user = new User({username: req.body.username});
  //creating a new user with the request from the form on the bodya
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

app.post('/api/users/:_id/exercises', (req, res) =>{
  if(req.body.date == "" || req.body.date == undefined){
    var currentDate = new Date();
    req.body.date = currentDate.toDateString()
  }else{
		dateStr = req.body.date;	
		var toDate = (dateStr) => {
  		var [year, month, day] = dateStr.split("-")
  		return new Date(year, month - 1, day)
		}
		req.body.date = toDate(dateStr).toDateString();
	}//date treatments

	User.findOne({_id: req.params._id})
		.populate('newExerciseSchema')
		.sort({ field: 'asc' })
		.exec((err, data) =>{
		if (err) console.log(err)

		//console.log(data)
		const exercise = new Exercise({
			username: data,
			description: req.body.description,
			duration: req.body.duration,
			date: req.body.date
		});//instancing new exercise

		res.json({
			_id: req.params._id,
			username: data.username,
			date: req.body.date,
			duration: parseInt(req.body.duration),
			description: req.body.description
		})//success
		//console.log(data.username)
		exercise.save(function(err,result){
			if (err){console.log(err);}
			else{console.log(result)}
		})
	})	
})
//Learning how to properly the populate function was a pain in the ass, got through thanks to an Indian youtube video, kudos to him, i had been 3 days stuck and lost my weekend, but it worth it.

//TO DO BELOW
app.get('/api/users/:_id/logs?:limit', (req, res) => {
	
	let limit = parseInt(req.query.limit)
	console.log(typeof limit)
	
	User.findOne({_id: req.params._id})
		.populate('newExerciseSchema')
		.exec((err, data) =>{//find the user with that specific id & exec()

	Exercise.find({username: req.params._id})
	.select({'_id': 0, 'username': 0, '__v': 0})
	.limit(limit)
	.exec (function(err, exerciseLog) {
		if (err) console.log(err)
		res.json({
			_id: req.params._id,
			username: data.username,
			count: exerciseLog.length,
			log:exerciseLog
		})
	})	//Exercise.find
	})	//User.findOne	
})

//RESET DB
app.get('/clear', (req, res) =>{
	User.deleteMany({}, function(err) { 
		console.log('collection removed') 
	});
	Exercise.deleteMany({}, function(err) { 
		console.log('collection removed') 
	});
})

const listener = app.listen(process.env.PORT || 3000, () => {
	console.log('Your app is listening on port ' + listener.address().port)
})
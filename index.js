const express = require('express')
const app = express()
const cors = require('cors')
const bodyParser = require('body-parser')
require('dotenv').config()

var users = []
var logs = []
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors())
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

app.get('/api/users', (req, res) => {
  const _users = users.map(u => {
    return {_id: "" + u._id, username: u.username, __v:0}
  })
  res.json(_users)
})

app.post('/api/users', (req, res) => {
  const id = users.length + 1
  const data = {_id: id, username: req.body.username, log: []}
  users.push(data)
  res.json({_id: "" + id, username: req.body.username})
})

app.post('/api/users/:_id/exercises', (req, res) => {
  const id = req.params._id
  const user = users.find(u => u._id == id)
  const description = req.body.description
  const duration = req.body.duration
  const date = req.body.date && req.body.date.trim() !== "" ? req.body.date : (new Date()).toISOString().split('T')[0]
  const data = {_id: ""+id, username: user.username, date: (new Date(date)).toDateString(), duration: Number(duration), description}
  user.log.push({description, duration: Number(duration), date: (new Date(date)).toDateString()})
  res.json(data)
})

app.get('/api/users/:_id/logs', (req, res) => {
  const id = req.params._id
  const user = users.find(u => u._id == id)
  const from = req.query.from ? new Date(req.query.from) : null;
  const to = req.query.to ? new Date(req.query.to) : null;
  const limit = req.query.limit ?? false
  let logs = user.log;
  logs = logs.filter(item => {
    const itemDate = new Date(item.date);

    if (from && itemDate < from) return false;
    if (to && itemDate > to) return false;

    return true;
  });
 
  if (limit) {
    logs = logs.slice(0, Number(limit));
  }
  // user._id = "" + user._id
  // user.count = logs.length
  // user.log = logs
  // res.json(user)
  const response = {
    _id: user._id,
    username: user.username,
    count: logs.length,
    log: logs
  }
  if(from && to)
  {
    response.from = from.toDateString()
    response.to = to.toDateString()
  }
  res.json(response)
})


const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})

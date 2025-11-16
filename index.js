require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
//const cors = require('cors')
const Person = require('./models/person')

const app = express()

//app.use(cors())
app.use(express.static('dist'))
app.use(express.json())

const requestLogger = (request, response, next) => {
  console.log('Method:', request.method)
  console.log('Path:  ', request.path)
  console.log('Body:  ', request.body)
  console.log('---')
  next()
}

app.use(requestLogger)

morgan.token('body', (req) => {
  return req.method === 'POST' ? JSON.stringify(req.body) : ''
})

app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))

app.get('/api/persons/', (req, res) => {
  Person.find({}).then(person => {
    res.json(person)
  })
})

// app.get('/info', (request, response) => {

//     var currentdate = new Date()
//     const daysNames = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']
//     const monthNames = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec']

//     var datetime = daysNames[currentdate.getDay()] + " "
//         + monthNames[(currentdate.getMonth())] + " "
//         + currentdate.getDate() + " "
//         + currentdate.getFullYear() + " "
//         + currentdate.getHours() + ":"
//         + currentdate.getMinutes() + ":"
//         + currentdate.getSeconds();


//     response.send(`
//         <div>Phonebook has info for ${persons.length} people</div>
//         <div>${datetime}</div>
//     `)
//     console.log(datetime)
// })

app.get('/api/persons/:id', (req, res, next) => {
  Person.findOne({ id: `${req.params.id}` })
    .then(entry => {
      entry ? res.json(entry) : res.status(404).end()
    })
    .catch(err => next(err))
})

app.delete('/api/persons/:id', (req, res, next) => {
  Person.deleteOne({ id: req.params.id })
    .then(() => {
      res.status(204).end()
    })
    .catch(err => next(err))
})

app.post('/api/persons', (req, res, next) => {
  const reqBody = req.body
  console.log(reqBody)

  if (!reqBody) {
    return res.status(400).json({
      error: 'missing info'
    })
  }

  Person.find({})
    .then(result => {
      return result.length > 0
        ? Math.max(...result.map(person => person.id)) + 1
        : 0
    })
    .then(newId => {
      const newPerson = new Person({
        id: newId.toString(),
        name: reqBody.name,
        number: reqBody.number
      })
      newPerson.save()
        .then(savedPerson => {
          res.json(savedPerson)
        })
        .catch(err => next(err))
    })
})

app.put('/api/persons/:id', (req, res, next) => {
  const { number } = req.body
  console.log(req.params.id, req.body)

  Person.findOne({ id: req.params.id })
    .then(person => {
      if (!person) {
        return res.status(404).end()
      }

      person.number = number

      return person.save().then((updatedPerson) => {
        res.json(updatedPerson)
      })
    })
    .catch(err => next(err))
})

const unknownEndpoint = (req, res) => {
  res.status(404).send({ err: 'unknown endpoint' })
}

app.use(unknownEndpoint)

const errorHandler = (err, req, res, next) => {
  console.error(err.message)

  if (err.name === 'CastError') {
    return res.status(400).send({ err: 'malformatted id' })
  } else if (err.name === 'ValidationError') {
    return res.status(400).json({ err: err.message })
  }

  next(err)
}

app.use(errorHandler)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`port running on ${PORT}`)
})
const express = require('express')
const morgan = require('morgan')
//const cors = require('cors')

const app = express()

//app.use(cors())
app.use(express.static('dist'))
app.use(express.json())

morgan.token('body', (req) => {
    return req.method === 'POST' ? JSON.stringify(req.body) : ''
})

app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))

let persons = [
    { 
      "id": "1",
      "name": "Arto Hellas", 
      "number": "040-123456"
    },
    { 
      "id": "2",
      "name": "Ada Lovelace", 
      "number": "39-44-5323523"
    },
    { 
      "id": "3",
      "name": "Dan Abramov", 
      "number": "12-43-234345"
    },
    { 
      "id": "4",
      "name": "Mary Poppendieck", 
      "number": "39-23-6423122"
    }
]

app.get('/', function (req, res) {
  res.send('hello, world!')
})

app.get('/api/persons/', (req, res) => {
    res.json(persons)
})

app.get('/info', (request, response) => {

    var currentdate = new Date(); 
    const daysNames = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']
    const monthNames = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec']

    var datetime = daysNames[currentdate.getDay()] + " "
        + monthNames[(currentdate.getMonth())] + " "
        + currentdate.getDate() + " "
        + currentdate.getFullYear() + " "
        + currentdate.getHours() + ":"  
        + currentdate.getMinutes() + ":" 
        + currentdate.getSeconds();


    response.send(`
        <div>Phonebook has info for ${persons.length} people</div>
        <div>${datetime}</div>
    `)
    console.log(datetime)
})

app.get('/api/persons/:id', (req, res) => {
    let id = req.params.id
    let entry = persons.find(person => person.id === id)
    entry ? res.json(entry) : res.status(404).end()
})

app.delete('/api/persons/:id', (req, res) => {
    let id = req.params.id
    persons = persons.filter(person => person.id !== id)
    console.log(persons)
    res.status(204).end()
})

app.post('/api/persons', (req, res) => {
    const reqBody = req.body
    console.log(reqBody)

    if (!reqBody) {
        return res.status(400).json({
            error: "missing info"
        })
    }

    let newId = persons.length > 0 
        ? Math.max(...persons.map(person => person.id)) + 1 
        : 0

    const newPerson = {
        id: String(newId),
        name: reqBody.name,
        number: reqBody.number
    }

    persons = persons.concat(newPerson)
    res.json(newPerson)
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log(`port running on ${PORT}`)
})
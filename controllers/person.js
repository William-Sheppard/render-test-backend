const personRouter = require('express').Router()
const Person = require('../models/person')

personRouter.get('/', (req, res) => {
  Person.find({}).then(person => {
    res.json(person)
  })
})

personRouter.get('/:id', (req, res, next) => {
  Person.findOne({ id: `${req.params.id}` })
    .then(entry => {
      entry ? res.json(entry) : res.status(404).end()
    })
    .catch(err => next(err))
})

personRouter.delete('/:id', (req, res, next) => {
  Person.deleteOne({ id: req.params.id })
    .then(() => {
      res.status(204).end()
    })
    .catch(err => next(err))
})

personRouter.post('/', (req, res, next) => {
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

personRouter.put('/:id', (req, res, next) => {
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

module.exports = personRouter
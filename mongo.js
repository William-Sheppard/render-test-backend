const mongoose = require('mongoose')

if (process.argv.length < 3) {
  console.log('give password as argument')
  process.exit(1)
}

const password = encodeURIComponent(process.argv[2])

const url = `mongodb+srv://shep:${password}@cluster0.k1agffw.mongodb.net/phonebookApp?appName=Cluster0`

mongoose.set('strictQuery',false)

mongoose.connect(url, { family: 4 })

const personSchema = new mongoose.Schema({
  id: String,
  name: {
    type: String,
    minLength: 3,
    required: true,
  },
  number: {
    type: String,
    minLength: 3,
    required: true,
  },
})

const Person = mongoose.model('Person', personSchema)

if (process.argv.length === 3) {
  console.log('Phonebook:')
  Person.find({}).then(result => {
    console.log(result)
    result.forEach(person => {
      console.log(person.name, person.number)
    })
    mongoose.connection.close()
  })
} else if (process.argv.length === 5) {
    Person.find({})
      .then(result => {
        return result.length > 0 
        ? Math.max(...result.map(person => person.id)) + 1 
        : 0
      })
      .then(newId => {
        let person = new Person({
            id: String(newId),
            name: process.argv[3],
            number: process.argv[4],
        })

        person.save().then(result => {
          console.log(`added ${process.argv[3]} number ${process.argv[4]} to phonebook`)
          mongoose.connection.close()
        })
      })
}

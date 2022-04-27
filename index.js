require('dotenv').config()
const express = require('express')
const { json } = require('express/lib/response')
const morgan = require('morgan')
const cors = require('cors')
const Person = require('./models/person')
const res = require('express/lib/response')

const app = express()

morgan.token('body', function (req, res) { return JSON.stringify(req.body) } )
morgan.format('tiny2', ':method :url :status :res[content-length] - :response-time ms :body')

const errorHandler = (error, request, response, next) => {
    console.error(error.message)
  
    if (error.name === 'CastError') {
      return response.status(400).send({ error: 'malformatted id' })
    }
  
    next(error)
}

app.use(express.static('build'))
app.use(express.json())
app.use(morgan('tiny2'))
app.use(cors())


// app.get('/', (req, res) => {
//     res.send('<h1>Hello</h1><p>Pages:<p/><ul><li>/api/persons</li></ul>')
// })

app.get('/api/persons', (req, res) => {
    Person.find({}).then(persons => {
        res.json(persons)
    })
})

app.get('/info', (req, res) => {
    Person.find({}).then(persons => {
        res.send('Phonebook has info for ' + persons.length + ' people<br>' + Date())
    })
})

app.get('/api/persons/:id', (request, response, next) => {
    Person.findById(request.params.id)
    .then(person => {
        if (person) {
            response.json(person)
        } 
        else {
            response.status(404).end()
        }
    })
    .catch(error => next(error))
})  

app.delete('/api/persons/:id', (request, response, next) => {
    Person.findByIdAndRemove(request.params.id)
     .then(result => {
         response.status(204).end()
     })
     .catch(error => next(error))
})

const generateId = () => {
    const min = 1
    const max = 1000
    return Math.floor(Math.random() * (max - min) + min)
}

app.post('/api/persons', (request, response) => {
    const body = request.body

    if (body.name === undefined || body.name === '') {
      return response.status(400).send({ error: 'name missing' })
    }
    else if (body.number === undefined || body.number === '') {
        return response.status(400).json({ 
        error: 'number missing' 
        })
    }

    const person = new Person({
        name: body.name,
        number: body.number,
    })

    console.log(person)

    person.save().then(savedPerson => {
        response.json(savedPerson)
    })
})

app.put('/api/persons/:id', (request, response, next) => {
    const body = request.body
  
    const person = ({
        name: body.name,
        number: body.number,
    })
  
    Person.findByIdAndUpdate(request.params.id, person, { new: true })
      .then(updatedPerson => {
        response.json(updatedPerson)
      })
      .catch(error => next(error))
})

app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
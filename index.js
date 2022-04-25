const express = require('express')
const { json } = require('express/lib/response')
const morgan = require('morgan')
const app = express()

app.use(express.json())

morgan.token('body', function (req, res) { return JSON.stringify(req.body) } )
morgan.format('tiny2', ':method :url :status :res[content-length] - :response-time ms :body')
app.use(morgan('tiny2'))

let persons = [
    {
        "name": "Arto Hellas",
        "number": "040-123456",
        "id": 1
      },
      {
        "name": "Ada Lovelace",
        "number": "39-44-5323523",
        "id": 2
      },
      {
        "name": "Dan Abramov",
        "number": "12-43-234345",
        "id": 3
      },
      {
        "name": "Mary Poppendieck",
        "number": "39-23-6423122",
        "id": 4
      }
    ]

app.get('/', (req, res) => {
    res.send('<h1>Hello</h1>')
})

app.get('/api/persons', (req, res) => {
    res.json(persons)
})

app.get('/info', (req, res) => {
    res.send('Phonebook has info for ' + persons.length + ' people<br>' + Date())
})

app.get('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    const person = persons.find(person => person.id === id)

    if (person) {
        response.json(person)
    } 
    else {
        response.status(404).end()
    }
  })  

app.delete('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    persons = persons.filter(person => person.id !== id)

    response.status(204).end()
})

const generateId = () => {
    const min = 1
    const max = 1000
    return Math.floor(Math.random() * (max - min) + min)
}

app.post('/api/persons', (request, response) => {
    const body = request.body

    if (!body.name) {
        return response.status(400).json({ 
        error: 'name missing' 
        })
    }
    else if (!body.number) {
        return response.status(400).json({ 
        error: 'number missing' 
        })
    }
    else if (persons.some(p => p.name === body.name)) {
        return response.status(400).json({ 
        error: 'name must be unique' 
        })
    }

    const person = {
        name: body.name,
        number: body.number,
        date: new Date(),
        id: generateId(),
    }

    persons = persons.concat(person)

    response.json(person)
})

const PORT = 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
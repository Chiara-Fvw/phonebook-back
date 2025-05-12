const express = require('express');
const morgan = require('morgan');
const Person = require('./models/person');
const app = express();

app.use(express.static('dist'))
app.use(express.json());

morgan.token('data', function (req, res) { 
  return JSON.stringify(req.body); 
});

app.use(morgan(function (tokens, req, res) {
    return [
      tokens.method(req, res),
      tokens.url(req, res),
      tokens.status(req, res),
      tokens.res(req, res, 'content-length'), '-',
      tokens['response-time'](req, res), 'ms',
      tokens.data(req, res)
    ].join(' ')
  })
);

/* let entries = [
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
] */

app.get('/', (request, response) => {
  response.send('<h1>Phone Book</h1>');
});

app.get('/api/persons', (request,response) => {
  Person.find({}).then(persons => {
    response.json(persons);
  });
});

app.get('/api/persons/:id', (request, response, next) => {
  Person.findById(request.params.id)
      .then(person => {
        if (person) {
          response.json(person);
        } else {
          response.status(404).end();
        }
      })
      .catch(err => next(err));
});

app.get('/info', (request,response, next) => {
  Person.countDocuments()
    .then(result => {
      console.log(result)
      response.send(`
        <p>Phonebook has info for ${result} people</p> 
        <p>${new Date()}</p>`)
    })
    .catch(err => next(err));
});

app.delete('/api/persons/:id', (request, response, next) => {
  Person.findByIdAndDelete(request.params.id)
    .then(result => {
      response.status(204).end();
    })
    .catch(err => next(err));
});

app.post('/api/persons', (request, response, next) => {
  let data = request.body;
  if (!data) return response.status(400)
                            .json({error: 'Something went wrong.'});
  
  if (!data.name) return response.status(400)
                          .json({error: "The entry must have a name."});
  
  if (!data.number) return response.status(400)
                          .json({error: 'Entries must have a number'});

  Person.find({name: data.name})
        .then(result => {
          if (result.length > 0) return response.status(400).json({error: 'Name must be unique'});

          const person = new Person({
            name: data.name,
            number: data.number
          });
          
          return person.save()
            .then(savedPerson => {
              response.json(savedPerson);
            })
            .catch(err => next(err)); 
        });
});

const errorHandler = (error, request, response, next) => {
  console.error(error.message);
  console.error(error)

  if (error.name === 'CastError') {
    return response.status(400).send({error: 'malformatted id'});
  }

  next(error);
}

app.use(errorHandler);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
});
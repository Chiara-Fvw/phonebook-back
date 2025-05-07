const express = require('express');
const morgan = require('morgan');

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

let entries = [
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

app.get('/', (request, response) => {
  response.send('<h1>Phone Book</h1>');
});

app.get('/api/persons', (request,response) => {
  response.json(entries)
});

app.get('/api/persons/:id', (request, response) => {
  let id = request.params.id;
  person = entries.find(person => person.id === id);

  person ? response.json(person) : response.status(404).end()
})

app.get('/info', (request,response) => {
  response.send(`
    <p>Phonebook has info for ${entries.length} people</p> 
    <p>${new Date()}</p>`)
});

app.delete('/api/persons/:id', (request, response) => {
  let id = request.params.id;
  entries = entries.filter(person => person.id !== id);
  response.status(204).end();
});

app.post('/api/persons', (request, response) => {
  let data = request.body;
  if (!data) return response.status(400)
                            .json({error: 'Something went wrong.'});
  
  if (!data.name) return response.status(400)
                          .json({error: "The entry must have a name."});
  
  if (!data.number) return response.status(400)
                          .json({error: 'Entries must have a number'});
  
  const nameExists = entries.find(({name}) => name === data.name);
 
  if (nameExists) return response.status(400)
                          .json({error: 'Name must be unique'});
  
  const person = {
      id: String(Math.floor(Math.random() * 101)),
      ...data    
    }
    entries = entries.concat(person);
    response.json(person)
  
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
});
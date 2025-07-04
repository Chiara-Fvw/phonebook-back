const mongoose = require('mongoose')

mongoose.set('strictQuery', false)

const url = process.env.MONGODB_URI
//MONGODB_URI="your_connection_string_here" npm run dev

console.log('connecting to ', url)

mongoose.connect(url)
  .then(result => console.log('connected to MongoDB'))
  .catch(err => console.log('error connecting to MongoDB: ', err.message))

const personSchema = new mongoose.Schema({
  name: {
    type: String,
    minLength: 3,
    required: true
  },
  number: {
    type: String,
    minLength: 8,
    validate: {
      validator: function(num) {
        return /^\d{2,3}-\d{4,}$/.test(num)
      },
      message: props => `${props.value} not a valid phone number: ***-*****`
    },
    required: [true, 'User phone number is required']
  }
})

personSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})

module.exports = mongoose.model('Person', personSchema)
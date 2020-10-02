require('dotenv').config()

const MONGODB_URI = process.env.MONGODB_URI
const PORT = process.env.PORT
const mongoOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
  UseCreateIndex: true
}

module.exports = {
  MONGODB_URI,
  PORT,
  mongoOptions
}
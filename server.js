const express = require('express')
const cors = require('cors')
const dotenv = require('dotenv')
const connectDB = require('./backend/config/db')
const authRoutes = require('./backend/routes/auth')
const transactionRoutes = require('./backend/routes/transactions')

dotenv.config()

const app = express()

app.use(cors())
app.use(express.json())

connectDB()

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/transactions', transactionRoutes)

app.get('/', (req, res) => {
  res.send('Server is running!')
})

const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
const express = require('express')
const mongoose = require('mongoose')
const app = express()
const port = 4000
const cookieParser = require('cookie-parser');
app.use(cookieParser());

app.use(express.json()) //Pour forcer le format de req en json 
const cors = require('cors');

app.use(cors({
    credentials: true // enable set cookie
}))

app.use('/uploads', express.static('uploads'))
const jwt = require('jsonwebtoken')

mongoose.connect('mongodb://127.0.0.1:27017/SocialMedia');
const db = mongoose.connection;
db.on('error', (error) => {
    console.error('Connection error:', error);
});

db.once('open', function () {
    console.log('Database connected successfully')
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})

const router = require('./Routes/Routes')
const adminRouter = require('./Routes/AdminRoutes')
app.use('/', router)
app.use('/Admin', adminRouter)

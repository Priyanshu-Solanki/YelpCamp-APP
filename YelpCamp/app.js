if(process.env.NODE_ENV !== 'production'){
    require('dotenv').config()
}

const express = require('express')
const app = express()
const path = require('path')
const mongoose = require('mongoose');
const session = require('express-session')
const methodOverride = require('method-override')
const ejsMate = require('ejs-mate')
const ExpressErrors = require('./utilities/ExpressErorrs')
const flash = require('connect-flash')
const passport = require('passport')
const localStrategy = require('passport-local')
const User = require('./models/user')

const campgroundRoute = require('./routes/campgroundRoute')
const reviewRoute = require('./routes/reviewRoute');
const usersRoute = require('./routes/usersRoute')


mongoose.connect('mongodb://127.0.0.1:27017/yelp-camp');

const db = mongoose.connection
db.on("error", console.error.bind(console, "connection error:"))
db.once("open", () => {
    console.log("Database Connected")
})

app.engine('ejs', ejsMate)
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))
app.use(express.urlencoded({ extended: true }))
app.use(methodOverride('_method'))
app.use(express.static(path.join(__dirname, 'public')))

const sessionConfig = {
    secret: 'Its a secret',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}
app.use(session(sessionConfig))
app.use(flash())

app.use(passport.initialize())
app.use(passport.session())
passport.use(new localStrategy(User.authenticate()))

passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())

app.use((req,res,next)=>{
    res.locals.currentUser = req.user
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error')
    next()
})

app.use('/campgrounds', campgroundRoute)
app.use('/campgrounds/:id/reviews', reviewRoute)
app.use('/', usersRoute)

app.get('/', (req, res) => {
    res.render('home')
})


app.all('*', (req, res, next) => {
    next(new ExpressErrors('Page Not Found', 404))
})

app.use((err, req, res, next) => {
    const { status = 500 } = err
    if (!err.message) err.message = 'Something Went Wrong'
    res.status(status).render('error', { err })
})

app.listen(3000, () => {
    console.log('Port 3000')
})

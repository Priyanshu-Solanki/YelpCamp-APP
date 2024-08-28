const express = require('express')
const app = express()
const path = require('path')
const mongoose = require('mongoose');
const Campground = require('./models/campground');
const campground = require('./models/campground');
const methodOverride = require('method-override')
const ejsMate = require('ejs-mate')
const catchAsync = require('./utilities/catchAsync')
const ExpressErrors = require('./utilities/ExpressErorrs')
const {campgroundSchema} = require('./schemas.js')

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



const validateCampground = (req,res,next)=>{
    
    const {error} = campgroundSchema.validate(req.body)
    if(error)
    {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressErrors(msg, 400)
    }
    else
    {
        next()
    }
}


app.get('/', (req, res) => {
    res.render('home')
})

app.get('/campgrounds', catchAsync(async (req, res) => {
    const campgrounds = await Campground.find({})
    res.render('campgrounds/index', { campgrounds })
}))

app.get('/campgrounds/add', (req, res) => {
    res.render('campgrounds/create')
})

app.post('/campgrounds', validateCampground, catchAsync(async (req, res, next) => {
    // if(!req.body.campground) throw new ExpressErrors('Invalid Campground Data', 400)
       
        const campground = new Campground(req.body.campground)
        await campground.save()
        res.redirect(`campgrounds/${campground.id}`)

}))

app.get('/campgrounds/:id', catchAsync(async (req, res) => {
    const { id } = req.params
    const campground = await Campground.findById(id)
    res.render('campgrounds/show', { campground })
}))

app.get('/campgrounds/:id/edit', catchAsync(async (req, res, next) => {
        const { id } = req.params
        const campground = await Campground.findById(id)
        res.render('campgrounds/edit', { campground })
}))

app.put('/campgrounds/:id', validateCampground, catchAsync(async (req, res) => {
    const { id } = req.params
    const campground = await Campground.findByIdAndUpdate(id, req.body.campground, { new: true, runValidators: true })
    res.redirect(`${campground.id}`)
}))

app.delete('/campgrounds/:id', catchAsync(async (req, res) => {
    const { id } = req.params
    await Campground.findByIdAndDelete(id)
    res.redirect('/campgrounds')
}))

app.all('*', (req,res,next)=>{
    next(new ExpressErrors('Page Not Found',404))
})

app.use((err, req, res, next) => {
    const{status = 500} = err
    if(!err.message) err.message = 'Something Went Wrong'
    res.status(status).render('error', {err})
})

app.listen(3000, () => {
    console.log('Port 3000')
})

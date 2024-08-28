const express = require('express')
const app = express()
const path = require('path')
const mongoose = require('mongoose');
const Campground = require('./models/campground');
const campground = require('./models/campground');
const methodOverride = require('method-override')
const ejsMate = require('ejs-mate')

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

app.get('/', (req, res) => {
    res.render('home')
})

app.get('/campgrounds', async (req, res) => {
    const campgrounds = await Campground.find({})
    res.render('campgrounds/index', { campgrounds })
})

app.get('/campgrounds/add', (req, res) => {
    res.render('campgrounds/create')
})

app.post('/campgrounds', async (req, res) => {
    const campground = new Campground(req.body.campground)
    await campground.save()
    res.redirect(`campgrounds/${campground.id}`)
})

app.get('/campgrounds/:id', async (req, res) => {
    const { id } = req.params
    const campground = await Campground.findById(id)
    res.render('campgrounds/show', { campground })
})

app.get('/campgrounds/:id/edit', async (req, res) => {
    const { id } = req.params
    const campground = await Campground.findById(id)
    res.render('campgrounds/edit', { campground })
})

app.put('/campgrounds/:id', async (req, res) => {
    const { id } = req.params
    const campground = await Campground.findByIdAndUpdate(id, req.body.campground, {new : true, runValidators : true})
    res.redirect(`${campground.id}`)
})

app.delete('/campgrounds/:id', async (req, res) => {
    const { id } = req.params
    await Campground.findByIdAndDelete(id)
    res.redirect('/campgrounds')
})

app.listen(3000, () => {
    console.log('Port 3000')
})

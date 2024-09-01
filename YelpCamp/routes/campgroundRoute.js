const express = require('express')
const router = express.Router()
const catchAsync = require('../utilities/catchAsync')
const mongoose = require('mongoose');
const Campground = require('../models/campground');
const ExpressErrors = require('../utilities/ExpressErorrs')
const { campgroundSchema } = require('../schemas.js');

const validateCampground = (req, res, next) => {

    const { error } = campgroundSchema.validate(req.body)
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressErrors(msg, 400)
    }
    else {
        next()
    }
}

router.get('/', catchAsync(async (req, res) => {
    const campgrounds = await Campground.find({})
    res.render('campgrounds/index', { campgrounds })
}))

router.get('/add', (req, res) => {
    res.render('campgrounds/create')
})

router.post('/', validateCampground, catchAsync(async (req, res, next) => {
    // if(!req.body.campground) throw new ExpressErrors('Invalid Campground Data', 400)

    const campground = new Campground(req.body.campground)
    await campground.save()
    req.flash('success', 'Successfully added a new campground')
    res.redirect(`campgrounds/${campground.id}`)

}))

router.get('/:id', catchAsync(async (req, res) => {
    const { id } = req.params
    const campground = await Campground.findById(id).populate('reviews')
    if (!campground) {
        req.flash('error', 'Campgrount not found!!!')
        return res.redirect('/campgrounds')
    }
    res.render('campgrounds/show', { campground })
}))

router.get('/:id/edit', catchAsync(async (req, res, next) => {
    const { id } = req.params
    const campground = await Campground.findById(id)
    if (!campground) {
        req.flash('error', 'Campgrount not found!!!')
        return res.redirect('/campgrounds')
    }
    res.render('campgrounds/edit', { campground })
}))

router.put('/:id', validateCampground, catchAsync(async (req, res) => {
    const { id } = req.params
    const campground = await Campground.findByIdAndUpdate(id, req.body.campground, { new: true, runValidators: true })
    req.flash('success', 'Successfully edited the campground')
    res.redirect(`${campground.id}`)
}))

router.delete('/:id', catchAsync(async (req, res) => {
    const { id } = req.params
    await Campground.findByIdAndDelete(id)
    req.flash('success', 'Campground deleted successfully')
    res.redirect('/campgrounds')
}))

module.exports = router
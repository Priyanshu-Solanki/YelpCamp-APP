const express = require('express')
const router = express.Router({mergeParams : true})
const mongoose = require('mongoose');
const Campground = require('../models/campground');
const catchAsync = require('../utilities/catchAsync')
const ExpressErrors = require('../utilities/ExpressErorrs')
const {  reviewSchema } = require('../schemas.js');
const Review = require(('../models/review'))

const validateReview = (req, res, next) => {

    const { error } = reviewSchema.validate(req.body)
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressErrors(msg, 400)
    }
    else {
        next()
    }
}

router.post('/', validateReview, catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id)
    const review = new Review(req.body.review)
    campground.reviews.push(review)
    await review.save()
    await campground.save()
    req.flash('success', 'Review added successfully')
    res.redirect(`/campgrounds/${campground.id}`)
}))

router.delete('/:reviewId', catchAsync(async(req,res)=>{
    const{id, reviewId} = req.params
    await Campground.findByIdAndUpdate(id, {$pull : {reviews: reviewId}})
    await Review.findByIdAndDelete(reviewId)
    req.flash('success', 'Review deleted successfully')
    res.redirect(`/campgrounds/${id}`)
}))

module.exports = router
const express = require('express')
const router = express.Router({mergeParams : true})
const mongoose = require('mongoose');
const Campground = require('../models/campground');
const catchAsync = require('../utilities/catchAsync')
const ExpressErrors = require('../utilities/ExpressErorrs')
const {  reviewSchema } = require('../schemas.js');
const Review = require(('../models/review'))
const { validateReview, isLoggedIn, isReviewOwner } = require('../middleware.js')
const reviews = require('../controllers/reviews')


router.post('/', isLoggedIn, validateReview, catchAsync(reviews.addReview))

router.delete('/:reviewId', isLoggedIn, isReviewOwner,  catchAsync(reviews.deleteReview))

module.exports = router
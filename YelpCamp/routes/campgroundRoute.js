const express = require('express')
const router = express.Router()
const catchAsync = require('../utilities/catchAsync')
const mongoose = require('mongoose');
const Campground = require('../models/campground');
const ExpressErrors = require('../utilities/ExpressErorrs')
const campgrounds = require('../controllers/campgrounds')
const { isLoggedIn, isOwner, validateCampground } = require('../middleware.js')
const multer = require('multer')
const { storage } = require('../cloudinary')
const upload = multer({ storage })

router.route('/')
    .get(catchAsync(campgrounds.index))
    .post(isLoggedIn, upload.array('image'), validateCampground, catchAsync(campgrounds.addCampground))


router.get('/add', isLoggedIn, campgrounds.renderAddForm)

router.route('/:id')
    .get(catchAsync(campgrounds.showCampground))
    .put(isLoggedIn, isOwner, upload.array('image'), validateCampground, catchAsync(campgrounds.editCampground))
    .delete(isLoggedIn, isOwner, catchAsync(campgrounds.deleteCampground))

router.get('/:id/edit', isLoggedIn, isOwner, catchAsync(campgrounds.renderEditForm))


module.exports = router
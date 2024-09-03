const Review = require('./models/review')
const Campground = require('./models/campground');
const ExpressErrors = require('./utilities/ExpressErorrs')
const { campgroundSchema, reviewSchema } = require('./schemas.js');

module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.session.returnTo = req.originalUrl;
        req.flash('error', "You must be signedin to create a new campground")
        return res.redirect('/login')
    }
    next()
}

module.exports.storeReturnTo = (req, res, next) => {
    if (req.session.returnTo) {
        res.locals.returnTo = req.session.returnTo;
    }
    next();
}


module.exports.validateCampground = (req, res, next) => {
    const { error } = campgroundSchema.validate(req.body)
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressErrors(msg, 400)
    }
    else {
        next()
    }
}

module.exports.isOwner = async (req,res,next) => {
    const { id } = req.params
    const campground = await Campground.findById(id)
    if (!campground.owner.equals(req.user._id)) {
        req.flash('error', 'Do not have permission')
        return res.redirect(`/campgrounds/${id}`)
    }
    next()
}

module.exports.isReviewOwner = async (req,res,next) => {
    const { id, reviewId } = req.params
    const review = await Review.findById(reviewId)
    if (!review.owner.equals(req.user._id)) {
        req.flash('error', 'Do not have permission')
        return res.redirect(`/campgrounds/${id}`)
    }
    next()
}

module.exports.validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body)
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressErrors(msg, 400)
    }
    else {
        next()
    }
}
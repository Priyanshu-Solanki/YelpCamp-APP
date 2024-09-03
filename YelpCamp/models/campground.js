const mongoose = require('mongoose')
const Schema = mongoose.Schema
const Review = require('./review')
const { cloudinary } = require('../cloudinary')

const ImageSchema = new Schema({
    url: String,
    filename: String,
})

ImageSchema.virtual('thumbnail').get(function(){
    return this.url.replace('/upload', '/upload/w_150')
})

const CampgroundSchema = new Schema({
    title: String,
    price: Number,
    images: [ImageSchema],
    description: String,
    location: String,
    owner: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    reviews: [{
        type: Schema.Types.ObjectId,
        ref: 'Review'
    }]
})

CampgroundSchema.post('findOneAndDelete', async function (data) {
    if (data) {
        await Review.deleteMany({
            _id: {
                $in: data.reviews
            }
        })
    }
    for (let d of data.images) {
        await cloudinary.uploader.destroy(d.filename)
    }

})

module.exports = mongoose.model('Campground', CampgroundSchema)
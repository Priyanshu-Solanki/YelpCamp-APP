const mongoose = require('mongoose')
const Schema = mongoose.Schema
const Review = require('./review')
const { cloudinary } = require('../cloudinary')
const { required, number } = require('joi')

const ImageSchema = new Schema({
    url: String,
    filename: String,
})

ImageSchema.virtual('thumbnail').get(function(){
    return this.url.replace('/upload', '/upload/w_150')
})

const opts = { toJSON: { virtuals: true } };

const CampgroundSchema = new Schema({
    title: String,
    price: Number,
    images: [ImageSchema],
    geometry:{
        type:{
            type : String,
            enum: ['Point'],
            required : true
        },
        coordinates:{
            type : [Number],
            required : true
        }
    },
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
}, opts);

CampgroundSchema.virtual('properties.popUpMarkup').get(function () {
    return `
    <strong><a href="/campgrounds/${this._id}">${this.title}</a><strong>
    <p>${this.description.substring(0, 20)}...</p>`
});

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
const mongoose = require('mongoose')

const reviewSchema = new mongoose.Schema({
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    body: String,
    rating: Number
})

module.exports = mongoose.model('Review', reviewSchema)
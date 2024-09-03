const Campground = require('../models/campground')
const { cloudinary } = require('../cloudinary')

module.exports.index = async (req, res) => {
    const campgrounds = await Campground.find({})
    res.render('campgrounds/index', { campgrounds })
}
module.exports.renderAddForm = (req, res) => {
    res.render('campgrounds/create')
}

module.exports.addCampground = async (req, res, next) => {
    // if(!req.body.campground) throw new ExpressErrors('Invalid Campground Data', 400)]
    const campground = new Campground(req.body.campground)
    campground.images = req.files.map(f => ({ url: f.path, filename: f.filename }))
    campground.owner = req.user._id
    await campground.save()
    console.log(campground)
    req.flash('success', 'Successfully added a new campground')
    res.redirect(`campgrounds/${campground._id}`)
}

module.exports.showCampground = async (req, res) => {
    const { id } = req.params
    const campground = await Campground.findById(id).populate({
        path: 'reviews',
        populate: {
            path: 'owner'
        }
    }).populate('owner')
    if (!campground) {
        req.flash('error', 'Campgrount not found!!!')
        return res.redirect('/campgrounds')
    }
    res.render('campgrounds/show', { campground })
}

module.exports.renderEditForm = async (req, res, next) => {
    const { id } = req.params
    const campground = await Campground.findById(id)
    if (!campground) {
        req.flash('error', 'Campgrount not found!!!')
        return res.redirect('/campgrounds')
    }

    res.render('campgrounds/edit', { campground })
}

module.exports.editCampground = async (req, res) => {
    const { id } = req.params
    const campground = await Campground.findByIdAndUpdate(
        id, req.body.campground, { new: true, runValidators: true })
    const imgs = req.files.map(f => ({ url: f.path, filename: f.filename }))
    campground.images.push(...imgs)
    await campground.save()
    if (req.body.deleteImages) {
        for(let filename of req.body.deleteImages)
        {
            await cloudinary.uploader.destroy(filename)
        }
        await campground.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } })
    }

    req.flash('success', 'Successfully edited the campground')
    res.redirect(`${campground.id}`)
}

module.exports.deleteCampground = async (req, res) => {
    const { id } = req.params
    await Campground.findByIdAndDelete(id)
    req.flash('success', 'Campground deleted successfully')
    res.redirect('/campgrounds')
}
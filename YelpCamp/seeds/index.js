const mongoose = require('mongoose');
const Campground = require('../models/campground')
const cities = require('./cities')
const indiancities = require('./cities')
const { places, descriptors } = require('./seedHelpers')

mongoose.connect('mongodb://127.0.0.1:27017/yelp-camp');

const db = mongoose.connection
db.on("error", console.error.bind(console, "connection error:"))
db.once("open", () => {
    console.log("Database Connected")
})

// const sample = (array) => array[Math.floor(Math.random() * array.length)]

const seedDB = async () => {
    await Campground.deleteMany({})
    for (let i = 0; i < cities.length; i++) {
        const price = Math.floor(Math.random() * 5000) + 100;
        const camp = new Campground({
            owner: '66d4f585abb4de23d6f3a5bb',
            location: `${cities[i].city}, ${cities[i].state}`,
            title: `${cities[i].place_to_visit}`,
            description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Corrupti assumenda dolorem pariatur, officiis quae provident consequatur expedita adipisci eius, odit dolores harum eos. Ipsum, libero optio?',
            price,
            geometry: {
                "type": "Point",
                "coordinates": [cities[i].place_longitude, cities[i].place_latitude]
            },
            images: [
                {
                    url: `https://picsum.photos/400?random=${i}`,
                    filename: `seeds`
                },
                {
                    url: `https://picsum.photos/400?random=${i + cities.length}`,
                    filename: `seeds`
                },
                {
                    url: `https://picsum.photos/400?random=${i + 2 * cities.length}`,
                    filename: `seeds`
                },
            ]
        })
        const campground = Campground.findOne({title : {$in : `${cities[i].place_to_visit}`}})
        if(campground)
        {
            await camp.save()
        }
    }
}

seedDB().then(() => {
    mongoose.connection.close()
})
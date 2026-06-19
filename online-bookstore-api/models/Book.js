const mongoose = require('mongoose');

const BookSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Book title is required']
    },
    author: {
        type: String,
        required: [true, 'Author name is required']
    },
    genre: {
        type: String,
        default: 'General'
    },
    price: {
        type: Number,
        required: [true, 'Price is required']
    },
    publishedDate: {
        type: Date,
        default: Date.now
    },
    inStock: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

module.exports = mongoose.model('Book', BookSchema);

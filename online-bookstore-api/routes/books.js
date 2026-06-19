const express = require('express');
const router = express.Router();
const Book = require('../models/Book');

// @route   GET /api/books
// @desc    Get all books (With advanced search & pagination features)
router.get('/', async (req, res, next) => {
    try {
        const { author, genre, page = 1, limit = 10 } = req.query;
        let query = {};

        // Search features
        if (author) {
            query.author = { $regex: author, $options: 'i' }; // Case-insensitive partial search
        }
        if (genre) {
            query.genre = { $regex: genre, $options: 'i' };
        }

        // Pagination calculations
        const pageNumber = parseInt(page);
        const limitNumber = parseInt(limit);
        const skip = (pageNumber - 1) * limitNumber;

        const books = await Book.find(query)
                                .skip(skip)
                                .limit(limitNumber);

        const totalBooks = await Book.countDocuments(query);

        res.status(200).json({
            success: true,
            count: books.length,
            pagination: {
                totalBooks,
                currentPage: pageNumber,
                totalPages: Math.ceil(totalBooks / limitNumber),
                limit: limitNumber
            },
            data: books
        });
    } catch (error) {
        next(error);
    }
});

// @route   GET /api/books/:id
// @desc    Get a single book by ID
router.get('/:id', async (req, res, next) => {
    try {
        const book = await Book.findById(req.params.id);
        if (!book) {
            return res.status(404).json({ success: false, error: 'Book not found with this ID' });
        }
        res.status(200).json({ success: true, data: book });
    } catch (error) {
        // Handle invalid MongoDB ObjectIDs gracefully
        if (error.kind === 'ObjectId') {
            return res.status(404).json({ success: false, error: 'Book not found with this ID format' });
        }
        next(error);
    }
});

// @route   POST /api/books
// @desc    Add a new book
router.post('/', async (req, res, next) => {
    try {
        const { title, author, price, genre, publishedDate, inStock } = req.body;

        // Manual validation verification as required by prompt rules
        if (!title || !author || price === undefined) {
            return res.status(400).json({
                success: false,
                error: 'Please provide all required fields: title, author, and price.'
            });
        }

        const newBook = await Book.create({
            title,
            author,
            price,
            genre,
            publishedDate,
            inStock
        });

        res.status(201).json({ success: true, data: newBook });
    } catch (error) {
        next(error);
    }
});

// @route   PUT /api/books/:id
// @desc    Update an existing book by ID
router.put('/:id', async (req, res, next) => {
    try {
        const { title, author, price } = req.body;

        // Ensure required values aren't being set to empty values
        if (req.body.hasOwnProperty('title') && !title) {
            return res.status(400).json({ success: false, error: 'Title cannot be empty' });
        }
        if (req.body.hasOwnProperty('author') && !author) {
            return res.status(400).json({ success: false, error: 'Author cannot be empty' });
        }
        if (req.body.hasOwnProperty('price') && price === undefined) {
            return res.status(400).json({ success: false, error: 'Price cannot be empty' });
        }

        const book = await Book.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        if (!book) {
            return res.status(404).json({ success: false, error: 'Book not found with this ID' });
        }

        res.status(200).json({ success: true, data: book });
    } catch (error) {
        if (error.kind === 'ObjectId') {
            return res.status(404).json({ success: false, error: 'Book not found with this ID format' });
        }
        next(error);
    }
});

// @route   DELETE /api/books/:id
// @desc    Delete a book by ID
router.delete('/:id', async (req, res, next) => {
    try {
        const book = await Book.findByIdAndDelete(req.params.id);
        if (!book) {
            return res.status(404).json({ success: false, error: 'Book not found with this ID' });
        }
        res.status(200).json({ success: true, message: 'Book successfully deleted' });
    } catch (error) {
        if (error.kind === 'ObjectId') {
            return res.status(404).json({ success: false, error: 'Book not found with this ID format' });
        }
        next(error);
    }
});

module.exports = router;

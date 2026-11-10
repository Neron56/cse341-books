// src/controllers/books.js
import { getAllBooks, getBookById as getBookByIdFromDb, createBook as createBookFromDb, updateBook as updateBookFromDb, deleteBook as deleteBookFromDb, authorExists } from '../models/books.js';

const getBooksHandler = async (req, res) => {
  try {
    const books = await getAllBooks();
    return res.status(200).json(books);
  } catch (error) {
    console.error('GET /books failed:', error.message);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

const getBookByIdHandler = async (req, res) => {
  const requestedId = req.params.id;

  try {
    const book = await getBookByIdFromDb(requestedId);

    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    return res.status(200).json(book);
  } catch (error) {
    console.error('GET /books/:id failed:', error.message);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

const createBook = async (req, res) => {
  try {
    const { id, author, title, publicationDate } = req.body;

    if (!id || !author || !title || !publicationDate) {
      return res.status(400).json({ message: 'Missing required book fields.' });
    }

    const existingBook = await getBookByIdFromDb(id);
    if (existingBook) {
      return res.status(400).json({ message: 'Book id already exists.' });
    }

    if (await authorExists(author) == 0) {
      return res.status(409).json({ message: 'book cannot be created because the author doesnt exist.' });
    }
    const createdBook = await createBookFromDb({ id, author, title, publicationDate });
    return res.status(201).json(createdBook);
  } catch (error) {
    return res.status(500).json({ message: 'Unable to create Book.' });
  }
};

const updateBook = async (req, res) => {
  try {
    const { id } = req.params;
    const { author, title, publicationDate } = req.body;

    if (!author || !title || !publicationDate) {
      return res.status(400).json({ message: 'Missing required Book fields.' });
    }

    const existingBook = await getBookByIdFromDb(id);
    if (!existingBook) {
      return res.status(404).json({ message: 'Book not found.' });
    }

    if (await authorExists(id)) {
      return res.status(409).json({ message: 'book cannot be created because the author doesnt exist.' });
    }

    const updatedBook = await updateBookFromDb(id, { author, title, publicationDate });
    return res.status(200).json(updatedBook);
  } catch (error) {
    return res.status(500).json({ message: 'Unable to update book.' });
  }
};

const deleteBook = async (req, res) => {
  try {
    const { id } = req.params;

    const existingBook = await getBookByIdFromDb(id);
    if (!existingBook) {
      return res.status(404).json({ message: 'Book not found.' });
    }

    await deleteBookFromDb(id);
    return res.status(204).send();
    
  } catch (error) {
    return res.status(500).json({ message: 'Unable to delete book.' });
  }
};

export { getBooksHandler, getBookByIdHandler, getAllBooks, createBook, updateBook, deleteBook};
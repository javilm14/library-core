var express = require('express');
var router = express.Router();

var bookController = require('../controllers/book_controller');

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', { title: 'library-core' });
});

// Autoload de comandos con :bookId
router.param('bookId', bookController.load);

// Definición de rutas de /books
router.get('/books', bookController.index);
router.get('/books/:bookId(\\d+)', bookController.show);
//router.post('/books/', bookController.create);
//router.put('/books/:bookId(\\d+)', bookController.update);
//router.delete('/books/:bookId(\\d+)', bookController.destroy);

// Definición de rutas para formatos
//router.get('/books/:bookId(\\d+)/formats/', formatController.show);
//router.get('/books/:bookId(\\d+)/formats/:formatId', formatController.get);
//router.post('/books/:bookId(\\d+)/formats/', formatController.create);
//router.put('/books/:bookId(\\d+)/formats/:formatId', formatController.update);
//router.delete('/books/:bookId(\\d+)/formats/:formatId', formatController.destroy);

module.exports = router;

var express = require('express');
var router = express.Router();

var bookController = require('../controllers/book_controller');
var webController = require('../controllers/web_controller');
//var formatController = require('../controllers/format_controller');

/* GET home page. */
router.get('/', function(req, res) {
	// Redirigimos a la interfaz web del servicio
  res.redirect('/web/books/');
});

// Autoload de comandos
router.param('bookId', bookController.load);
router.param('webBookId', webController.load);
//router.param('formatId', formatController.load);

// Definición de rutas del servicio (/books)
router.get('/books', bookController.index);
router.get('/books/:bookId(\\d+)', bookController.show);
//router.post('/books/', bookController.create);
//router.put('/books/:bookId(\\d+)', bookController.update);
//router.delete('/books/:bookId(\\d+)', bookController.destroy);

// Definición de rutas de la web (/web/books)
router.get('/web/books', webController.index);
router.get('/web/books/:webBookId(\\d+)', webController.show);

module.exports = router;

var models = require('../models/models.js');
var request = require('request');

var core_service = 'http://' + process.env.CORE_ADDRESS 
			+ ':' + process.env.CORE_PORT;

// Autoload - factoriza el código si ruta incluye :webBookId
exports.load = function(req, res, next, webBookId) {
	console.log('    --> load');

	var format = req.query.format || '';
	var query = core_service + '/books/' + webBookId;
	if (format.length > 0)
		query = query.concat('?format=' + format);

	request(query, function (error, response, body) {
	  if (!error && response.statusCode == 200) {
	    //console.log(body);
	    req.book = JSON.parse(body);
	    next();
	  }
	});
};

// GET /web/books
exports.index = function(req, res) {

	var search = req.query.search || '';
	var query = core_service + '/books/';

	if (search.length > 0)
		query = query.concat('?search=' + search);

	console.log('query: ' + query);

	request(query, function (error, response, body) {
	  if (!error && response.statusCode == 200) {
	    //console.log(body) // Show the HTML for the Google homepage.
	    res.render('web/books/index.ejs', { books: JSON.parse(body), errors: []});
	  }
	});
};

// GET /web/books/:bookId
exports.show = function(req, res) {
	console.log('    --> show');
	console.log('    --> req.book.url: ' + req.book.url);
	//if (req.book.url) {
	//	res.render('web/books/download.ejs', 
	//		{ url: req.book.url, errors: []});
	//} else {
		res.render('web/books/show.ejs', { book: req.book, errors: []});
	//}
}
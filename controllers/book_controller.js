var models = require('../models/models.js');

// Autoload - factoriza el código si ruta incluya :quizId
exports.load = function(req, res, next, bookId) {
	console.log('load, bookId: ' + bookId);
	models.books.find({
		where: { id: Number(bookId) }
	}).then(function(book) {
			if (book) {
				req.book = book;
				next();
			} else { next(new Error('No existe bookId=' + bookId));}
		}
	).catch(function(error) { next(error);});
};

// GET /books
exports.index = function(req, res) {

	var search = req.query.search || '';
	search = '%' + search.replace(new RegExp(' ', 'g'), '%') + '%';
	console.log(models.books);
	models.books.findAll().then(function(books) {
		res.json(books);
	});
}

// GET /books/:bookId(\\d+)
exports.show = function(req, res) {
	res.json(req.book);
}
//var search = req.query.search || '';
//models.books.find({
//	where: { id: Number(bookId) },
//	include: [{ model: models.Comment }]
//}).then(function(quiz) {
//		if (quiz) {
//			req.quiz = quiz;
//			next();
//		} else { next(new Error('No existe quizId=' + quizId));}
//	}
//).catch(function(error) { next(error);});

// POST /books/

// PUT /books/:bookId(\\d+)

// DELETE /books/:bookId(\\d+)





// GET /books/:bookId(\\d+)/formats/

// GET /books/:bookId(\\d+)/formats/:formatId

// POST /books/:bookId(\\d+)/formats/

// PUT /books/:bookId(\\d+)/formats/:formatId

// DELETE /books/:bookId(\\d+)/formats/:formatId
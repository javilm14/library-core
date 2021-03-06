var models = require('../models/models.js');
var fs = require("fs");

var AdmZip = require('adm-zip');
var exec = require('sync-exec');
//require('shelljs/global');

var library_path = process.env.LIBRARY_PATH;

// Autoload - factoriza el código si ruta incluye :bookId
exports.load = function(req, res, next, bookId) {

	console.log('    --> BookController: Resolviendo load()...');
	models.books.find({
		where: { id: Number(bookId) }
	}).then(function(book) {
			if (book) {
				var format = req.query.format || '';

				var formats = process.env.FORMATS_LIST;

				var image_url = getCover(book);
				var sinopsis = getSinopsis(book);
				var formats_list = formats.split(',');

				book['dataValues']['image_url'] = image_url;
				book['dataValues']['sinopsis'] = sinopsis;
				book['dataValues']['formats'] = formats_list;
				if (format.length > 0) {
					var link = getLink(book, format)
					if (link.length > 0) {
						book['dataValues']['url'] = link;
					}
				}
				req.book = book;
				
				console.log('Obteniendo serie...');			
				models.books_series_link
				.findAll({ where: 
					{book: 
						{$like: book.id}
					} 
				})
				.then(function(books_series_link) {
					if (books_series_link.length > 0) {
						models.series
						.findAll({ where:
							{id: 
								{$like: books_series_link[0]['dataValues']['series']}
							}
						})
						.then(function(series) {
							console.log('Obteniendo serie...OK');
							book['dataValues']['series'] = series[0]['dataValues']['name'];
							next();
						});
					} else {
						console.log('Obteniendo serie...OK');
						book['dataValues']['series'] = '';
						next();
					}
				}).catch(function(error) {
					console.log('Obteniendo serie...FAIL');
					next(error)
				});
				console.log('    --> BookController: Resolviendo load()...OK');
			} else { 
				console.log('    --> BookController: Resolviendo load()...FAIL');
				next(new Error('No existe bookId=' + bookId));
			}
		}
	).catch(function(error) { next(error);});
};

// GET /books
exports.index = function(req, res) {

	// Variables for filter
	var title = req.query.bookTitle || '';
	var author = req.query.bookAuthor || '';
	var serie = req.query.bookSerie || '';

	console.log("title: " + title);
	console.log("author: " + author);
	console.log("serie: " + serie);

	title = '%' + title.replace(new RegExp(' ', 'g'), '%') + '%';
	author = '%' + author.replace(new RegExp(' ', 'g'), '%') + '%';
	serie = '%' + serie.replace(new RegExp(' ', 'g'), '%') + '%';

	// Filtrar por título, autor y serie

	var authorResult = [];
	var serieResult = [];
	var authorResultIndex = [];
	var serieResultIndex = [];
	var results = [];

	var finishAuthor = false;
	var finishSerie = false;
	var finishAuthorIndex = false;
	var finishSerieIndex = false;

	// Buscamos el autor
	models.authors
	.findAll({ where: ["name like ?", author] })
	.then(function(authors) {
		var result = [];
		for (var i = 0; i < authors.length; i++) {
			result.push(authors[i].id)
		};

		models.books_authors_link
		.findAll({ where: 
			{author: 
				{$in: result}
			} 
		})
		.then(function(books_authors_link) {
			for (var i = 0; i < books_authors_link.length; i++) {
				authorResult.push(books_authors_link[i].book);
			};

			models.series
			.findAll({ where: ["name like ?", serie] })
			.then(function(series) {
				var result = [];
				for (var i = 0; i < series.length; i++) {
					result.push(series[i].id)
				};
		
				models.books_series_link
				.findAll({ where: 
					{series: 
						{$in: result}
					} 
				})
				.then(function(books_series_link) {
					for (var i = 0; i < books_series_link.length; i++) {
						serieResult.push(books_series_link[i].book);
					};

					var result = [];

					if (serie.length > 2) {
						for (var i = 0; i < serieResult.length; i++) {
							if (authorResult.indexOf(serieResult[i]) > -1) {
								result.push(serieResult[i]);
							}
						};
					} else {
						result = authorResult;
					}

					models.books
					.findAll({ where: 
						{
							id: {$in: result},
							title: {$like: title},
						},
						order: [['id', 'ASC']]
					})
					.then(function(books) {
						res.json(books);
					});					
		
				});
			});
		});
	});
}


// GET /books/:bookId(\\d+)
exports.show = function(req, res) {
	res.json(req.book);
}

// POST /books/

// PUT /books/:bookId(\\d+)

// DELETE /books/:bookId(\\d+)


// Funciones de utilidades
function getCover(book) {
	console.log('Obteniendo portada...');
	var book_path = library_path + book['path'] + '/';
	var image_path = 'images/covers/';
	var image_file = image_path + book['id'] + '.jpg';
	var cover_path = 'OEBPS/Images/cover.jpg';

	// La portada se enceuntra preparada?
	if (fs.existsSync('public/' + image_file)) {
		console.log('Obteniendo portada...OK');
		return image_file;
	}

	var files = fs.readdirSync(book_path);

	// La imagen se encuentra en el directorio?
	
	for (var i = 0; i < files.length; i++) {
	  if (files[i].indexOf('cover.jpg') > -1) {
		  var buf = fs.readFileSync(book_path + 'cover.jpg');
			fs.writeFileSync('public/' + image_file, buf);
			console.log('Obteniendo portada...OK');
			return image_file;
		}
	};

	// Se busca la imagen en el libro
	for (var i = 0; i < files.length; i++) {
		if (files[i].indexOf('.epub') > -1) {
    	var zip = new AdmZip(book_path + files[i]);
    	var zipEntries = zip.getEntries(); // an array of ZipEntry records 
 	  	for (var j = 0; j < zipEntries.length; j++) {
 	  		var aux = zipEntries[j]['entryName'].toString();
    	  if (aux.toLowerCase().indexOf(cover_path.toLowerCase()) > -1) {
					zip.extractEntryTo(aux, image_path, false, true);
					fs.renameSync(image_path + 'cover.jpg', 'public/' + image_file);
					console.log('Obteniendo portada...OK');
  				return image_file;
    	  }
    	}
		}
	};

	console.log('Obteniendo portada...FAIL');
  return null;
}

function getSinopsis(book) {
	console.log('Obteniendo sinopsis...');
	var book_path = library_path + book['path'] + '/';
	var sinopsis_path = 'OEBPS/Text/sinopsis.xhtml';

	var files = fs.readdirSync(book_path);

	// Extraemos el documento xhtml a la ruta temporal
	for (var i = 0; i < files.length; i++) {
		if (files[i].indexOf('.epub') > -1) {	
  		var zip = new AdmZip(book_path + files[i]);
  		var zipEntries = zip.getEntries(); // an array of ZipEntry records 
 			zipEntries.forEach(function(zipEntry) {
 				var aux = zipEntry['entryName'].toString();
  		  if (aux.indexOf(sinopsis_path) > -1) {
					zip.extractEntryTo(sinopsis_path, 'tmp', false, true);
  		  }
  		});
  	}
	}

	// Si se extrajo correctamente, se lee y se envía sólo el texto
	if (!fs.existsSync('tmp/sinopsis.xhtml')) {
		console.log('Obteniendo sinopsis...FAIL');
		return null;
	}
	var page = fs.readFileSync('tmp/sinopsis.xhtml').toString();
	var index = page.indexOf('<body>') + '<body>'.length;
	var aux = page.substring(index);
	aux = aux.replace('</body>', '').replace('</html>', '');
	
	fs.unlinkSync('tmp/sinopsis.xhtml');
	console.log('Obteniendo sinopsis...OK');
	return aux;
}

function getLink(book, format) {
	console.log('Obteniendo enlace de descarga...');

	if (format.length < 1) {
		console.log('Obteniendo enlace de descarga...FAIL');
		return undefined;
	}

	if (format.length > 0) {
		var book_path = library_path + book['path'] + '/';

		var index_format = -1;
		var epubBook = null;

		var formats = process.env.FORMATS_LIST.split(',');

		for (var i = 0; i < formats.length; i++) {
			if (formats[i].toLowerCase().
								indexOf(format.toLowerCase()) > -1) {
				index_format = i;
				break;
			}
		};


		if (index_format > -1) {
			// El formato enviado efectivamente 
			// es un formato válido de la lista
			var newFile = 'books/' + book.id + '.'
				+ formats[index_format].toLowerCase();

			if (fs.existsSync('public/' + newFile)) {

				// El libro ya está preparado
				console.log('Obteniendo enlace de descarga...OK');
				return '/' + newFile;

			} else {

				// Buscamos el formato en los archivos del
				// directorio del libro
				var files = fs.readdirSync(book_path);
				for (var i = 0; i < files.length; i++) {
					if (files[i].split('.').pop().
						toLowerCase().indexOf(format.toLowerCase()) > -1) {

						// El libro se encuentra en el formato pedido,
						// sólo hay que copiarlo a la ruta /books
						var buf = fs.readFileSync(book_path + files[i]);
						fs.writeFileSync('public/' + newFile, buf);
						console.log('Obteniendo enlace de descarga...OK');
						return '/' + newFile;
					}
					if (files[i].split('.').pop().
						toLowerCase().indexOf("epub".toLowerCase()) > -1) {
						epubBook = book_path + files[i];
					}
				};

				// La url no ha sido hallada en el libro,
				// por lo tanto hay que convertirlo y luego

				if (epubBook) {

					var cmd = '\"' + process.env.EBOOK_CONVERT + '\" \"' + 
										epubBook + '\" \"public/' + newFile + '\"';
					console.log('cmd: ' + cmd);
					try {
						var exec_print = exec(cmd);
						console.log(exec_print);
					} catch (err) {
						if (fs.existsSync('public/' + newFile)) {
							console.log('Obteniendo enlace de descarga...OK');
							return '/' + newFile;
						} else {
							console.log('Obteniendo enlace de descarga...FAIL');
							return undefined;
						}
					}

					console.log('Obteniendo enlace de descarga...OK');
					return '/' + newFile;
				}
				
			}
		}
	}
}

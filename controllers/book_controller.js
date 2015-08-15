var models = require('../models/models.js');
var fs = require("fs");

var AdmZip = require('adm-zip');
var exec = require('sync-exec');

var library_path = process.env.LIBRARY_PATH;

// Autoload - factoriza el código si ruta incluye :bookId
exports.load = function(req, res, next, bookId) {

	console.log('    --> bookLoad');
	models.books.find({
		where: { id: Number(bookId) }
	}).then(function(book) {
			if (book) {
				var format = req.query.format || '';

				var url = getCover(book);
				console.log('#### var url = getCover(book); --> ' + url);
				var sinopsis = getSinopsis(book);
				//var formats = getFormats(book);
				var formats = process.env.FORMATS_LIST.split(',');

				book['dataValues']['image_url'] = url;
				book['dataValues']['sinopsis'] = sinopsis;
				book['dataValues']['formats'] = formats;
				if (format.length > 0) {
					book['dataValues']['url'] = getLink(book, format);
				}
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
	models.books
	.findAll({ where: ["title like ?", search], order: [['title', 'ASC']]})
	.then(function(books) {
		res.json(books);
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
	var book_path = library_path + book['path'] + '/';
	var image_path = 'images/covers/';
	var image_file = image_path + book['id'] + '.jpg';
	var cover_path = 'OEBPS/Images/cover.jpg';
	console.log('    --> Se busca la portada');

	// La portada se enceuntra preparada?
	console.log('    --> image_file: ' + image_file);
	console.log('    --> fs.existsSync(image_file): ' + fs.existsSync(image_file));
	if (fs.existsSync('public/' + image_file)) {
		return image_file;
	}

	console.log('    --> book_path: ' + book_path);
	var files = fs.readdirSync(book_path);

	// La imagen se encuentra en el directorio?
	console.log('    --> Buscando la portada en el directorio del libro...');
	console.log('    --> files: ' + files);
	
	for (var i = 0; i < files.length; i++) {
	  if (files[i].indexOf('cover.jpg') > -1) {
	  	console.log('    --> Portada en ruta');
		  var buf = fs.readFileSync(book_path + 'cover.jpg');
			fs.writeFileSync('public/' + image_file, buf);
			return image_file;
		}
	};

	// Se busca la imagen en el libro
	console.log('    --> Portada en libro');
	console.log('    --> files: ' + files);
	for (var i = 0; i < files.length; i++) {
		console.log('    --> Dentro del for');
		if (files[i].indexOf('.epub') > -1) {
			console.log('    --> Se encontro el libro (.epub)');
			console.log('    --> book_path + files[i]: ' + book_path + files[i]);
    	var zip = new AdmZip(book_path + files[i]);
    	var zipEntries = zip.getEntries(); // an array of ZipEntry records 
 	  	for (var j = 0; j < zipEntries.length; j++) {
 	  		var aux = zipEntries[j]['entryName'].toString();
 	  		console.log('    --> aux: ' + aux);
    	  if (aux.toLowerCase().indexOf(cover_path.toLowerCase()) > -1) {
					console.log('    --> antes de extraer');
					zip.extractEntryTo(aux, image_path, false, true);
					fs.renameSync(image_path + 'cover.jpg', 'public/' + image_file);
					console.log('    --> #### Extraido y movido');
					console.log('    --> image_file: ' + image_file);
  				return image_file;
    	  }
    	}
		}
	};

  return null;
}

function getSinopsis(book) {
	var book_path = library_path + book['path'] + '/';
	var sinopsis_path = 'OEBPS/Text/sinopsis.xhtml';

	var files = fs.readdirSync(book_path);
	console.log('    --> files: ' + files);
	console.log('    --> files.length: ' + files.length);

	// Extraemos el documento xhtml a la ruta temporal
	// TODO modificar zipEntries para que sea síncrono (cambiar por un 'for')
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
		return null;
	}
	var page = fs.readFileSync('tmp/sinopsis.xhtml').toString();
	var index = page.indexOf('<body>') + '<body>'.length;
	console.log('    --> page.length: ' + page.length);
	console.log('    --> index: ' + index);
	var aux = page.substring(index);
	aux = aux.replace('</body>', '').replace('</html>', '');
	//console.log('    --> aux: ' + aux);
	
	fs.unlinkSync('tmp/sinopsis.xhtml');
	return aux;
}

function getLink(book, format) {

	if (format.length < 1) {
		return undefined;
	}

	console.log('**** FORMAT 1');
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

		console.log('**** FORMAT 2');

		if (index_format > -1) {
			// El formato enviado efectivamente 
			// es un formato válido de la lista
			var newFile = 'books/' + book.id + '.'
				+ formats[index_format].toLowerCase();

			if (fs.existsSync('public/' + newFile)) {

				// El libro ya está preparado
				return '/' + newFile;
				console.log('**** FORMAT 3');

			} else {

				// Buscamos el formato en los archivos del
				// directorio del libro
				console.log('**** FORMAT 4');
				var files = fs.readdirSync(book_path);
				for (var i = 0; i < files.length; i++) {
					if (files[i].split('.').pop().
						toLowerCase().indexOf(format.toLowerCase()) > -1) {

						// El libro se encuentra en el formato pedido,
						// sólo hay que copiarlo a la ruta /books
						var buf = fs.readFileSync(book_path + files[i]);
						console.log('####  1');
						fs.writeFileSync('public/' + newFile, buf);
						console.log('####  2');
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
						console.log(exec(cmd));
					} catch (err) {
							if (fs.existsSync('public/' + newFile)) {
							return '/' + newFile;
						}
					}

					return '/' + newFile;
				}
				
			}
		}
	}
}

//function getFormats(book) {
//	var book_path = library_path + book['path'] + '/';
//
//	var files = fs.readdirSync(book_path);
//	var formats = [];
//
//	for (var i = 0; i < files.length; i++) {
//		if ( files[i].indexOf('.jpg') === -1 
//			&& files[i].indexOf('.opf') === -1 
//			&& files[i].indexOf('.db') === -1 )	{
//			formats.push(files[i].split('.').pop())
//		}
//	};
//
//	return formats;
//}

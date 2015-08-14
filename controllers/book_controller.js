var models = require('../models/models.js');
var fs = require("fs");

var path = require('path');
var mime = require('mime');

var ls = require('node-ls');
var AdmZip = require('adm-zip');

var library_path = 'E:\\My Box Files\\Calibre\\';

// Autoload - factoriza el código si ruta incluye :bookId
exports.load = function(req, res, next, bookId) {

	console.log('    --> bookLoad');
	models.books.find({
		where: { id: Number(bookId) }
	}).then(function(book) {
			if (book) {
				var url = getCover(book);
				var sinopsis = getSinopsis(book);
				var formats = getFormats(book);

				book['dataValues']['image_url'] = url;
				book['dataValues']['sinopsis'] = sinopsis;
				book['dataValues']['formats'] = formats;
				req.book = book;

				var format = req.query.format || '';
				if (format.length > 0) {
					var book_path = library_path + book['path'].replace('/', '\\') + '\\';
					var files = fs.readdirSync(book_path);

					for (var i = 0; i < files.length; i++) {
						if (files[i].split('.').pop().indexOf(format) > -1) {
							// files[i] es el fichero a descargar
							console.log('####  Preparando libro para descargar...');
							var file = book_path + files[i];
							var newFile = 'books/' + bookId + '.' + format;
							console.log('####  file: ' + file);
							console.log('####  newFile: ' + 'public/' + newFile);
							//fs.createReadStream(file).pipe(fs.createWriteStream(newFile));
		  				var buf = fs.readFileSync(file);
							console.log('####  1');
							fs.writeFileSync('public/' + newFile, buf);
							console.log('####  2');
							req.book['dataValues']['url'] = '/' + newFile;
						}
					};
				}
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
	var book_path = library_path + book['path'].replace('/', '\\') + '\\';
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
 	  	zipEntries.forEach(function(zipEntry) {
 	  		var aux = zipEntry['entryName'].toString();
 	  		console.log('    --> aux: ' + aux);
    	  if (aux.toLowerCase().indexOf(cover_path.toLowerCase()) > -1) {
					console.log('    --> antes de extraer');
					zip.extractEntryTo(aux, image_path, false, true);
					fs.rename(image_path + 'cover.jpg', 'public/' + image_file, function (err) {
					  if (err) throw err;
						console.log('    --> image_file: ' + image_file);
					});
    	  }
    	});
		}
	};

  return null;
}

function getSinopsis(book) {
	var book_path = library_path + book['path'].replace('/', '\\') + '\\';
	var sinopsis_path = 'OEBPS/Text/sinopsis.xhtml';

	var files = fs.readdirSync(book_path);
	console.log('    --> files: ' + files);
	console.log('    --> files.length: ' + files.length);

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

function getFormats(book) {
	var book_path = library_path + book['path'].replace('/', '\\') + '\\';

	var files = fs.readdirSync(book_path);
	var formats = [];

	for (var i = 0; i < files.length; i++) {
		if ( files[i].indexOf('.jpg') === -1 && files[i].indexOf('.opf') === -1 )	{
			formats.push(files[i].split('.').pop())
		}
	};

	return formats;
}
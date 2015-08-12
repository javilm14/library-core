// Definición del modelo de libros
module.exports = function(sequelize, DataTypes) {
	return sequelize.define(
		'books',
			{
				title: {
					type: DataTypes.TEXT,
					validate: { notEmpty: {msg: "-> Falta Pregunta"}}
				},
				sort: {
					type: DataTypes.TEXT,
					validate: { notEmpty: {msg: "-> Falta Pregunta"}}
				},
				timestamp: {
					type: DataTypes.DATE
				},
				pubdate: {
					type: DataTypes.DATE
				},
				series_index: {
					type: DataTypes.FLOAT
				},
				author_sort: {
					type: DataTypes.TEXT
				},
				isbn: {
					type: DataTypes.TEXT
				},
				lccn: {
					type: DataTypes.TEXT
				},
				path: {
					type: DataTypes.TEXT
				},
				flags: {
					type: DataTypes.INTEGER
				},
				uuid: {
					type: DataTypes.TEXT
				},
				has_cover: {
					type: DataTypes.BOOLEAN
				},
				last_modified: {
					type: DataTypes.DATE
				}
			},
			{
				timestamps: false,
				createdAt: false,
				updatedAt: false
			}
		);
}
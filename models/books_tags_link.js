// Definición del modelo de autores
module.exports = function(sequelize, DataTypes) {
	return sequelize.define(
		'books_tags_link',
			{
				book: {
					type: DataTypes.INTEGER
				},
				tag: {
					type: DataTypes.INTEGER
				}
			},
			{
				timestamps: false,
				createdAt: false,
				updatedAt: false
			}
		);
}
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
				freezeTableName: true,
				timestamps: false,
				createdAt: false,
				updatedAt: false
			}
		);
}
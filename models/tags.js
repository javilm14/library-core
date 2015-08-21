// Definición del modelo de autores
module.exports = function(sequelize, DataTypes) {
	return sequelize.define(
		'tags',
			{
				name: {
					type: DataTypes.TEXT
				}
			},
			{
				timestamps: false,
				createdAt: false,
				updatedAt: false
			}
		);
}
// Definición del modelo de autores
module.exports = function(sequelize, DataTypes) {
	return sequelize.define(
		'data',
			{
				book: {
					type: DataTypes.INTEGER
				},
				format: {
					type: DataTypes.TEXT
				},
				uncompressed_size: {
					type: DataTypes.INTEGER
				},
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
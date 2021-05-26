module.exports = (app) => {
  app.mongoose.set('toJSON', {
    versionKey: false,
  });
  app.mongoose.set('toObject', {
    versionKey: false,
    virtuals: true,
  });
  app.mongoose.plugin(app.mongooseSchemaPlugins.globalPlugin);
};

module.exports = function g(schema) {
  schema.methods.toDraftObject = function toDraftObject() {
    const obj = this.toObject({
      depopulate: true,
    });

    delete obj._id;

    return obj;
  };

  schema.set('id', false);
};

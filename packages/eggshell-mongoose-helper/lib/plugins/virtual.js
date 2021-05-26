module.exports = function virtual(schema, keys) {
  if (!Array.isArray(keys)) {
    keys = [keys];
  }

  if (keys.some((k) => typeof k !== 'string')) {
    throw new Error('keys must be string');
  }

  keys = [...new Set(keys)];

  keys.forEach((key) => {
    const _key = Symbol(`__${key}`);

    schema.virtual(key)
      .get(function getValue() {
        return this[_key];
      })
      .set(function setValue(value) {
        this[_key] = value;
      });
  });
};

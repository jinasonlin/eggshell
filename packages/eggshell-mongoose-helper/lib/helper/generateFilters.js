module.exports = function generateFilters(schema) {
  const filters = {};
  schema.eachPath((key, value) => {
    if (value.instance === 'String') {
      filters[key] = 'string';
    } else if (value.instance === 'Boolean') {
      filters[key] = 'boolean';
    } else if (value.instance === 'Number') {
      filters[key] = 'number';
    } else if (value.instance === 'Date') {
      filters[key] = 'datetime';
    }
  });
  return filters;
};

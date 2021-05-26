function handleOption(arg, prop) {
  if (arg == null) {
    return null;
  }

  if (typeof arg === 'boolean') {
    return arg ? prop : null;
  }
  if (typeof arg[prop] === 'boolean') {
    return arg[prop] ? prop : null;
  }
  if (!(prop in arg)) {
    return prop;
  }
  return arg[prop];
}

module.exports = handleOption;

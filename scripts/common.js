
function identity(item) {
  return item;
}

Object.defineProperty(Array.prototype, "equals", {
  value: function (other) {
    if (this.length !== other.length) return false;
    for (let i = 0; i < this.length; ++i) {
      if (this[i] !== other[i]) return false;
    }
    return true;
  },
  enumerable: false,
  configurable: true
});

function clearObject(object) {
  if (typeof object !== "object" || object === null) return object;
  Object.values(object).forEach(function (key) {
    delete object[key];
  });
}

function cloneObject(object, depth = 1) {
  if (depth <= 0 || typeof object !== "object" || object === null) return object;
  let clone = object.constructor();
  Object.keys(object).forEach(function (key) {
    clone[key] = cloneObject(object[key], depth - 1);
  });
  return clone;
}

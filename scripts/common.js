
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


var TextExtractScheme = function (start, end, id) {
  // Object init
  Object.defineProperty(this, "length", {
    get: function () {
      return this.end - this.start;
    }
  });

  ExtractScheme.call(this, id);

  this.start = start;
  this.end = end;
};

TextExtractScheme.prototype = Object.create(ExtractScheme.prototype);

TextExtractScheme.prototype.constructor = TextExtractScheme;

TextExtractScheme.prototype.extract = function (source) {
  return source.content.substr(this.start, this.length);
}

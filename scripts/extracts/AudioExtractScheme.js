
var AudioExtractScheme = function (start, end, id) {
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

AudioExtractScheme.prototype = Object.create(ExtractScheme.prototype);

AudioExtractScheme.prototype.constructor = AudioExtractScheme;

AudioExtractScheme.prototype.extract = function (source) {
  return (this.start) + " to " + (this.start + this.length);
};

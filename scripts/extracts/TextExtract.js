
var TextExtract = function (source, scheme, id) {
  Extract.call(this, source, scheme, id);
};

TextExtract.prototype = Object.create(Extract.prototype);

TextExtract.prototype.constructor = TextExtract;

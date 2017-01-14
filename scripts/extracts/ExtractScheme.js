
var ExtractScheme = function (id) {
  // Internal management
  this.id = id = id || - ++ExtractScheme.schemesTempCount;
  ExtractScheme.schemes[id] = this;

};

ExtractScheme.schemes = [];
ExtractScheme.schemesTempCount = 0;

ExtractScheme.prototype.extract = function (source) {
  return source;
}

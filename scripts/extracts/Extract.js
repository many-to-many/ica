
var Extract = function (source, scheme, id) {
  // Object init
  Object.defineProperty(this, "extract", {
    get: function () {
      return {
        extract: this.scheme.extract(this.source),
        _extract: this,
        _source: this.source,
        _scheme: this.scheme
      }
    }.bind(this)
  });


  // Internal management
  this.id = id = id || - ++Extract.extractsTempCount;
  Extract.extracts[id] = this;

  // External management
  source.extracts[this.id] = this;

  // Init
  this.source = source;
  this.scheme = scheme;

  // console.log("New extract:", this, this.source, this.scheme);
};

Extract.extracts = [];
Extract.extractsTempCount = 0;

Extract.prototype.destroy = function () {
  // With external relations
  this.relations.forEach(function (relation) {
    relation.destroy();
  });

  // Internal management
  delete this.source.extracts[this.id];
  delete Extract.extracts[this.id];

  console.log("Extract destroyed:", this.id);
}

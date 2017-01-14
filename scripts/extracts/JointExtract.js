
var JointExtract = function (extracts, id) {
  // Object init
  Object.defineProperty(this, "extract", {
    get: function () {
      return this.extracts.map(function (extract) {
        return extract.extract()
      });
    }.bind(this)
  });

  // Internal management
  this.id = id = id || - ++JointExtract.jointExtractsTempCount;
  JointExtract.jointExtracts[id] = this;

  // With external relations
  this.relations = [];

  this.extracts = extracts;

  // console.log("New joint extract:", this, this.extracts);
};

JointExtract.jointExtracts = [];
JointExtract.jointExtractsTempCount = 0;

JointExtract.prototype.constructor = JointExtract;

JointExtract.prototype.relate = function (extract, directional = false) {
  return new Relation(this, extract, directional);
}

JointExtract.prototype.walkRelations = function (depth = 10) {
  if (typeof depth != "number") throw "depth must be number";
  if (depth <= 0) return {};
  return {
    relations: this.relations.map(function (relation) {
      var other = relation.head != this ? relation.head : relation.tail;
      return other.walkRelations(depth - 1);
    }.bind(this))
  }
}

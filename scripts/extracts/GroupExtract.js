
var GroupExtract = function (extracts, id) {
  // Internal management
  this.id = id = id || - ++GroupExtract.groupExtractsTempCount;
  GroupExtract.groupExtracts[id] = this;

  // With external relations
  this.relations = [];

  this.extracts = extracts;

  // console.log("New group extract:", this, this.extracts);
};

GroupExtract.groupExtracts = [];
GroupExtract.groupExtractsTempCount = 0;

GroupExtract.prototype = Object.create(JointExtract.prototype);

GroupExtract.prototype.constructor = GroupExtract;

GroupExtract.prototype.walkRelations = function (depth = 10) {
  if (typeof depth != "number") throw "depth must be number";
  if (depth <= 0) return this;
  return {
    extracts: this.extracts.map(function (extract) {
      return extract.walkRelations(depth);
    }),
    relations: this.relations.map(function (relation) {
      var other = relation.head != this ? relation.head : relation.tail;
      return other.walkRelations(depth - 1);
    }.bind(this))
  }
}

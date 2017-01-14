
var ExtractRelation = function (tailExtract, headExtract) {
  Relation.call(this, tailExtract, headExtract);

}

ExtractRelation.prototype = Object.create(Relation.prototype);

ExtractRelation.prototype.constructor = ExtractRelation;

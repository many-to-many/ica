
var Relation = function (tail, head, directional = false, id) {
  // Object init
  Object.defineProperty(this, "directional", {
    get: function () {
      return this._directional;
    }.bind(this),
    set: function (value) {
      if (typeof value != "boolean") throw "directional must be boolean";
      this._directional = value;
      this._directionalDidUpdate();
    }.bind(this)
  })

  // Internal management
  this.id = id = id || - ++Relation.relationsTempCount;
  Relation.relations[id] = this;

  // Init
  this.tail = tail;
  this.head = head;
  this.directional = directional;

  // console.log("New relation:", this, this.tail, this.head, this.label);
}

Relation.relations = [];
Relation.relationsTempCount = 0;

Relation.prototype.destroy = function () {
  delete this.tail.relations[this.head.id];
  delete this.head.relations[this.tail.id];

  // Internal management
  delete Relation.relations[this.id];
}

Relation.prototype._directionalDidUpdate = function () {
  if (this._directional) {
    // Directional
    this.tail.relations[this.head.id] = this;
    delete this.head.relations[this.tail.id];
  } else {
    // Bidirectional
    this.head.relations[this.tail.id] = this.tail.relations[this.head.id] = this;
  }
}

Relation.prototype.reverse = function () {
  var _ = this.tail;
  this.tail = this.head;
  this.head = _;
  this._directionalDidUpdate();
  console.log("Relation direction reversed:", this, this.tail, this.head);
}

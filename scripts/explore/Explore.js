
var Explore = Model.createComponent("Explore");

Explore.explores = {count: 0};

Explore.defineMethod("construct", function construct() {
  // Construct exploreId
  Object.defineProperty(this, "exploreId", {
    value: ++Explore.explores.count
  });
  Explore.explores[this.exploreId] = this;
});

Explore.defineMethod("init", function init(items) {
  // Init items
  this.items = items || [];
  return [];
});

Explore.defineMethod("uninit", function uninit() {
  // Uninit items
  delete this.items;
});

Explore.defineMethod("destruct", function destruct() {
  // Destruct exploreId
  delete Explore.explores[this.exploreId];
});

Explore.prototype.addItems = function (items) {
  Array.prototype.unshift.apply(this.items, items.reverse());
};

Explore.prototype.putItems = function (items) {
  this.items.splice(0, this.items.length);
  this.addItems(items);
}

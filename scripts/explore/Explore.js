
/**
 * Explore
 * Represents an unordered list of articles (JointSources) for the view controller to display. The view controller may choose to ignore the order given by the array and impose an arbitrary display order.
 * @constructor
 */
let Explore = Model.createComponent("Explore");

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

// Items

Explore.prototype.addItems = function addItems(items) {
  Array.prototype.push.apply(this.items, items);
};

Explore.prototype.putItems = function putItems(items) {
  this.items.splice(0, this.items.length);
  this.addItems(items);
};

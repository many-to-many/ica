
var MapController = function (element, map) {
  Controller.call(this, element);
  this.map = map;
};

MapController.createViewFragment = function (map) {
  var mapFragment = cloneTemplate("#template-map");
  var mapElement = mapFragment.querySelector(".map");
  // Adding elements
  map.levels.map(function (level) {
    var mapLevelFragment = MapLevelController.createViewFragment(level);
    // Attach controller
    var mapLevelController = new MapLevelController(mapLevelFragment.querySelector(".map-level"), level);
    mapElement.appendChild(mapLevelFragment);
  });
  setElementProperty(mapElement, "map", 0);
  return mapFragment;
}

MapController.prototype = Object.create(Controller.prototype);

MapController.prototype.constructor = MapController;

MapController.prototype.update = function () {
  var parentNode = this.view.parentNode;
  parentNode.replaceChild(MapController.createViewFragment(this.map), this.view);
  this.view = parentNode.querySelector("[data-ica-map='{0}']".format(this.map.id));
  Controller.prototype.update.call(this);
};

/*****/

var MapLevelController = function (view, level) {
  Controller.call(this, view);
  this.level = level;
};

MapLevelController.createViewFragment = function (level) {
  var mapLevelFragment = cloneTemplate("#template-map-level");
  var mapLevelElement = mapLevelFragment.querySelector(".map-level");
  if (level.sources) {
    level.sources.map(function (source) {
      var sourceFragment = TextSourceController.createViewFragment(source);
      // Attach controller
      var mapLevelController = new TextSourceController(sourceFragment.querySelector(".source"), source);
      mapLevelElement.appendChild(sourceFragment);
    })
  }
  return mapLevelFragment;
}

MapLevelController.prototype = Object.create(Controller.prototype);

MapLevelController.prototype.constructor = MapLevelController;

MapLevelController.prototype.update = function () {
  var parentNode = this.view.parentNode;
  parentNode.replaceChild(TextSourceController.createViewFragment(this.source), this.view);
  this.view = parentNode.querySelector("[data-ica-map-level='{0}']".format(this.source.sourceId));

  Controller.prototype.update.call(this);
};

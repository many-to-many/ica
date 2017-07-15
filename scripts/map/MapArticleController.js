
var MapArticleController = Controller.createComponent("MapArticleController");

MapArticleController.defineMethod("construct", function construct() {
  this.jointSourceController = undefined;
  Object.defineProperty(this, "jointSource", {
    get: function () {
      return this.jointSourceController.jointSource;
    }
  });
});

MapArticleController.defineMethod("init", function init(jointSource, view) {
  return [view];
});

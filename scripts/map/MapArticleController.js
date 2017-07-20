
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

// View

MapArticleController.defineMethod("hideView", function hideView() {
  if (this.componentOf) this.componentOf.hideView();
});

MapArticleController.defineMethod("unhideView", function unhideView() {
  if (this.componentOf) this.componentOf.unhideView();
});

/**
 * MapTextSourceController
 * Concrete view controller to display a text source.
 * @constructor
 */
let MapTextSourceController = MapSourceController.createComponent("MapTextSourceController");

MapTextSourceController.createViewFragment = function createViewFragment() {
  return cloneTemplate("#template-map-textsource");
};

// View

MapTextSourceController.defineMethod("initView", function initView() {
  if (!this.view) return;

  this.quill = new Quill(this.view.querySelector(".text"), {
    readOnly: true
  });

});

MapTextSourceController.defineMethod("updateView", function updateView() {
  if (!this.view) return;

  this.quill.setText(this.source.content);

});

MapTextSourceController.defineMethod("uninitView", function unitView() {
  if (!this.view) return;

  delete this.quill;

});

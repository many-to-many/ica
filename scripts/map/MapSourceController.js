
/**
 * MapSourceController
 * Abstract view controller to display a source model.
 * @constructor
 */
let MapSourceController = SourceController.createComponent("MapSourceController");

(function (MapSourceController) {

  MapSourceController.defineMethod("initView", function initView() {
    if (!this.view) return;

    this.view.addEventListener("click", viewOnClick);

  });

  MapSourceController.defineMethod("uninitView", function uninitView() {
    if (!this.view) return;

    this.view.removeEventListener("click", viewOnClick);

  });

  // Shared functions

  function viewOnClick(event) {
    event.stopPropagation();
  }

}(MapSourceController));

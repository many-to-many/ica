
/**
 * MapConversationSourceController
 * Abstract view controller to display a source model.
 * @constructor
 */
let MapConversationSourceController = SourceController.createComponent("MapConversationSourceController");

(function (MapConversationSourceController) {

  MapConversationSourceController.defineMethod("initView", function initView() {
    if (!this.view) return;

    this.view.addEventListener("click", viewOnClick);

  });

  MapConversationSourceController.defineMethod("uninitView", function uninitView() {
    if (!this.view) return;

    this.view.removeEventListener("click", viewOnClick);

  });

  // Shared functions

  function viewOnClick(event) {
    event.stopPropagation();
  }

}(MapConversationSourceController));

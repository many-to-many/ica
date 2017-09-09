
/**
 * MapDiscussionController
 * Concrete view controller to display a Discussion.
 * @constructor
 */
const MapDiscussionController = DiscussionController.createComponent("MapDiscussionController");

MapDiscussionController.createViewFragment = function createViewFragment() {
  return cloneTemplate("#template-map-discussion");
};

// View

(function (MapDiscussionController) {

  MapDiscussionController.defineMethod("initView", function initView() {
    if (!this.view) return;

    this.view.addEventListener("click", viewOnClick);

  });

  MapDiscussionController.defineMethod("updateView", function updateView() {
    if (!this.view) return;

    this.view.querySelectorAll("[data-ica-discussion-predicate]").forEach(function (element) {
      let predicate = getElementProperty(element, "discussion-predicate");
      element.style.display = isEmpty(this.discussion[predicate]) ? "none" : "";
    }.bind(this));

    this.view.querySelectorAll("[data-ica-discussion]").forEach(function (element) {
      element.textContent = this.discussion[getElementProperty(element, "discussion")]["0"];
    }.bind(this));

  });

  MapDiscussionController.defineMethod("uninitView", function uninitView() {
    if (!this.view) return;

    this.view.removeEventListener("click", viewOnClick);

  });

  // Shared functions

  function viewOnClick(event) {
    event.stopPropagation();
  }

}(MapDiscussionController));


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

    // Quill

    this.quillIntro = new Quill(this.view.querySelector("[data-ica-discussion='intro']"), {
      readOnly: true
    });

  });

  MapDiscussionController.defineMethod("updateView", function updateView() {
    if (!this.view) return;

    this.view.querySelectorAll("[data-ica-discussion-predicate]").forEach(function (element) {
      let predicate = getElementProperty(element, "discussion-predicate");
      element.style.display = isEmpty(this.discussion[predicate]) ? "none" : "";
    }.bind(this));

    this.view.querySelectorAll("[data-ica-discussion]").forEach(function (element) {
      let content = this.discussion[getElementProperty(element, "discussion")]["0"];

      switch (getElementProperty(element, "conversation-meta")) {
        case "intro": this.quillIntro.setText(content || ""); break;
        default: element.textContent = content;
      }
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

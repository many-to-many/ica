
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

    let editJointSourceAnchor = this.view.querySelector("[data-ica-action='edit-jointsource']");
    editJointSourceAnchor.href = "/discussions/{0}/edit".format(this.discussion.discussionId);
    editJointSourceAnchor.addEventListener("click", editJointSourceAnchorOnClick);
    editJointSourceAnchor.controller = this;

    // Quill

    this.quillIntro = new Quill(this.view.querySelector("[data-ica-jointsource='intro']"), {
      readOnly: true
    });

  });

  MapDiscussionController.defineMethod("updateView", function updateView() {
    if (!this.view) return;

    this.view.querySelectorAll("[data-ica-jointsource-predicate]").forEach(function (element) {
      let predicate = getElementProperty(element, "jointsource-predicate");
      element.style.display = isEmpty(this.discussion[predicate]) ? "none" : "";
    }.bind(this));

    this.view.querySelectorAll("[data-ica-jointsource]").forEach(function (element) {
      let content = this.discussion[getElementProperty(element, "jointsource")]["0"];

      switch (getElementProperty(element, "jointsource")) {
        case "intro": this.quillIntro.setText(content || ""); break;
        default: element.textContent = content;
      }
    }.bind(this));

  });

  MapDiscussionController.defineMethod("uninitView", function uninitView() {
    if (!this.view) return;

    this.view.removeEventListener("click", viewOnClick);

  });

  MapDiscussionController.prototype.displayPublisherDiscussionView = function displayPublisherDiscussionView() {
    let fragment = PublisherDiscussionController.createViewFragment();
    let element = fragment.querySelector(".publisher-container");
    document.body.querySelector(".app-view").appendChild(fragment);
    new PublisherDiscussionController(this.discussion, element);
  };

  // Shared functions

  function viewOnClick(event) {
    event.stopPropagation();
  }

  function editJointSourceAnchorOnClick(event) {
    event.preventDefault();

    this.controller.displayPublisherDiscussionView();
  }

}(MapDiscussionController));

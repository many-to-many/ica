
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

    this.discussion.forEachSource(function (source) {
      if (this.querySelector("[data-ica-source-id='{0}']".format(source.sourceId))) return;

      let fragment, element;
      switch (source.constructor) {
        case ImageSource:
          fragment = MapImageSourceController.createViewFragment();
          element = fragment.querySelector(".source");
          this.querySelector(".sources").appendChild(fragment);
          new MapImageSourceController(source, element).componentOf = this.controller;
          break;
        case AudioSource:
          fragment = MapAudioSourceController.createViewFragment();
          element = fragment.querySelector(".source");
          this.querySelector(".sources").appendChild(fragment);
          new MapAudioSourceController(source, element).componentOf = this.controller;
          break;
        case VideoSource:
          fragment = MapVideoSourceController.createViewFragment();
          element = fragment.querySelector(".source");
          this.querySelector(".sources").appendChild(fragment);
          new MapVideoSourceController(source, element).componentOf = this.controller;
          break;
        case TextSource:
        default:
          fragment = MapTextSourceController.createViewFragment();
          element = fragment.querySelector(".source");
          this.querySelector(".sources").appendChild(fragment);
          new MapTextSourceController(source, element).componentOf = this.controller;
      }
    }.bind(this.view));

    this.view.querySelector(".sources-title").hidden = this.discussion.getNumberOfSources() === 0;
    
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

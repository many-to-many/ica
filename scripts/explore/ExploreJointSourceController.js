
var ExploreJointSourceController = JointSourceController.createComponent("ExploreJointSourceController");

ExploreJointSourceController.createViewFragment = function () {
  return cloneTemplate("#template-explore-jointsource");
};

ExploreJointSourceController.defineAlias("model", "jointSource");

ExploreJointSourceController.defineMethod("initView", function initView() {
  if (!this.view) return;

  setElementProperty(this.view, "jointsource-id", this.jointSource.jointSourceId);
  this.view.style.order = - this.jointSource.jointSourceId;

  this.view.querySelector("[data-ica-action='edit-jointsource']").addEventListener("click", function (e) {
    e.preventDefault();
    e.stopPropagation();
    var fragment = PublisherJointSourceController.createViewFragment();
    var element = fragment.querySelector(".publisher");
    document.body.appendChild(fragment);
    new PublisherJointSourceController(this.controller.jointSource, element);
  }.bind(this.view));

  this.view.addEventListener("click", function (e) {
    e.preventDefault();
    e.stopPropagation();
    var map = new Map([this.controller.jointSource]);
    var fragment = MapController.createViewFragment();
    var element = fragment.querySelector(".map");
    document.body.appendChild(fragment);
    new MapController(map, element);
  }.bind(this.view));

  this.view.addEventListener("mouseover", function mouseOver() {
    if (this.controller.audio && this.controller.audio.paused) {
      this.controller.audio.play();
    }
  }.bind(this.view));

  this.view.addEventListener("mouseleave", function mouseLeave() {
    if (this.controller.audio) {
      this.controller.audio.pause();
      this.controller.audio.currentTime = 0;
    }
  }.bind(this.view));
});

ExploreJointSourceController.defineMethod("updateView", function updateView() {
  if (!this.view) return;

  // Reset view
  var parentNode = this.view.parentNode;
  var fragment = this.constructor.createViewFragment();
  var element = fragment.querySelector(".jointsource");
  parentNode.replaceChild(fragment, this.view);
  this.uninitView();
  this._view = element;
  this.initView(false);

  this.view.querySelectorAll("[data-ica-jointsource-meta]").forEach(function (element) {
    element.textContent = this.jointSource.meta[getElementProperty(element, "jointsource-meta")];
  }.bind(this));

  var imageSources = this.jointSource.imageSources;
  if (imageSources.length > 0) {
    var imageSource = imageSources[0];

    if (imageSource.content) {
      this.view.classList.add("dark");
      this.view.querySelector(".jointsource-backdrop-image").style.backgroundImage = imageSource.content
        ? "url(" + (
          imageSource.fileHandler.blob instanceof Blob
            ? imageSource.fileHandler.url
            : imageSource.fileHandler.url + "?width=" + (2 * this.view.offsetWidth * this.devicePixelRatio)
          ) + ")"
        : "";
    }
  }

  var audioSources = this.jointSource.audioSources;
  if (audioSources.length > 0) {
    var audioSource = audioSources[0];

    if (audioSource.content) {
      var audio = new Audio(audioSource.fileHandler.url);
      this.audio = audio;
    }
  }
});

ExploreJointSourceController.defineMethod("uninitView", function uninitView() {
  if (!this.view) return;

  removeElementProperty(this.view, "jointsource-id");
});

/*****/

function empty(value) {
  if (Array.isArray(value)) return value.length == 0;
  return !value;
}

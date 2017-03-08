
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

  var featuredSource = this.jointSource.sources[Object.keys(this.jointSource.sources)[0]];

  if (featuredSource) switch (featuredSource.constructor) {
  case ImageSource:

    setElementProperty(this.view, "jointsource-feature", "image");
    this.view.style.backgroundImage = featuredSource.content
      ? "url(" + (
        featuredSource.blobHandler.blob instanceof Blob
          ? featuredSource.blobHandler.url
          : featuredSource.blobHandler.url + "?width=" + (this.view.offsetWidth * this.devicePixelRatio)
        ) + ")"
      : "";

    break;
  case AudioSource:

    setElementProperty(this.view, "jointsource-feature", "audio");
    if (featuredSource.content) {
      var audio = new Audio(featuredSource.blobHandler.url);

      this.view.audio = audio;

      this.view.addEventListener("mouseover", function mouseOver() {
        this.audio.play();
      }.bind(this.view));
      this.view.addEventListener("mouseout", function mouseOver() {
        this.audio.pause();
        this.audio.currentTime = 0;
      }.bind(this.view));
    }

    break;
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

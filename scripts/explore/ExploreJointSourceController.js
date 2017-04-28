
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
    if (this.audio && this.audio.paused) {
      this.audio.play();
    }
  }.bind(this.view));

  this.view.addEventListener("mouseleave", function mouseLeave() {
    if (this.audio) {
      this.audio.pause();
      this.audio.currentTime = 0;
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
    element.textContent = this.jointSource.meta[getElementProperty(element, "jointsource-meta")] || "";
  }.bind(this));

  this.view.classList.remove("dark");
  var imageSources = this.jointSource.imageSources;
  if (imageSources.length > 0) {
    var imageSource = imageSources[0];

    if (imageSource.content["0"]) {
      this.view.classList.add("dark");
      this.view.querySelector(".jointsource-backdrop-image").style.backgroundImage = imageSource.content["0"]
        ? "url(" + (
          imageSource.fileHandler.blob instanceof Blob
            ? imageSource.fileHandler.url
            : imageSource.fileHandler.url + "?width=" + (this.view.offsetWidth * this.devicePixelRatio)
          ) + ")"
        : "";
    }
  }

  this.view.querySelector(".audio-on-hover").style.display = "none";
  var audioSources = this.jointSource.audioSources;
  if (audioSources.length > 0) {
    var audioSource = audioSources[0];

    delete this.audio;
    audioSource.getFileStats()
      .then(function (stats) {
        if (new Audio().canPlayType(stats.type) != "") {
          this.querySelector(".audio-on-hover").style.display = "";
          this.audio = new Audio(audioSource.fileHandler.url);
        }
      }.bind(this.view));
  }
});

ExploreJointSourceController.defineMethod("uninitView", function uninitView() {
  if (!this.view) return;

  removeElementProperty(this.view, "jointsource-id");
});

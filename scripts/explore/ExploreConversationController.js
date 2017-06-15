
var ExploreConversationController = ConversationController.createComponent("ExploreConversationController");

ExploreConversationController.createViewFragment = function () {
  return cloneTemplate("#template-explore-conversation");
};

ExploreConversationController.defineAlias("model", "conversation");

ExploreConversationController.defineMethod("initView", function initView() {
  if (!this.view) return;

  setElementProperty(this.view, "conversation-id", this.conversation.conversationId);
  this.view.style.order = - this.conversation.conversationId;

  this.view.querySelector("[data-ica-action='edit-conversation']").addEventListener("click", function (e) {
    e.preventDefault();
    e.stopPropagation();
    var fragment = PublisherConversationController.createViewFragment();
    var element = fragment.querySelector(".publisher");
    document.body.appendChild(fragment);
    new PublisherConversationController(this.controller.conversation, element);
  }.bind(this.view));

  this.view.addEventListener("click", function (e) {
    e.preventDefault();
    e.stopPropagation();
    var map = new Map([this.controller.conversation]);
    var fragment = MapController.createViewFragment();
    var element = fragment.querySelector(".map");
    document.body.appendChild(fragment);
    new MapController(map, element);
  }.bind(this.view));

  this.audioPreviewHandler = new AudioHandler();

  this.view.addEventListener("mouseenter", function () {
    this.audioPreviewHandler.play();
  }.bind(this));

  this.windowBlurEventListener = function () {
    this.audioPreviewHandler.stop(300);
  }.bind(this);

  this.view.addEventListener("mouseleave", this.windowBlurEventListener);
  window.addEventListener("blur", this.windowBlurEventListener);
});

ExploreConversationController.defineMethod("updateView", function updateView() {
  if (!this.view) return;
  
  this.view.querySelectorAll("[data-ica-conversation-meta]").forEach(function (element) {
    element.textContent = this.conversation.meta[getElementProperty(element, "conversation-meta")] || "";
  }.bind(this));

  this.view.classList.remove("dark");
  var imageSources = this.conversation.imageSources;
  if (imageSources.length > 0) {
    var imageSource = imageSources[0];

    if (imageSource.content["0"]) {
      this.view.classList.add("dark");

      var backdropImageElement = this.view.querySelector(".conversation-backdrop-image");
      var backgroundImage = imageSource.content["0"]
        ? "url(" + (
          imageSource.fileHandler.blob instanceof Blob
            ? imageSource.fileHandler.url
            : imageSource.fileHandler.url + "?width=" + (backdropImageElement.offsetWidth * this.devicePixelRatio)
              + "&height=" + (backdropImageElement.offsetHeight * this.devicePixelRatio)
          ) + ")"
        : "";
      if (backdropImageElement.style.backgroundImage != backgroundImage)
        backdropImageElement.style.backgroundImage = backgroundImage;
    }
  }

  this.view.querySelector(".audio-on-hover").style.display = "none";
  var audioSources = this.conversation.audioSources;
  if (audioSources.length > 0) {
    var audioSource = audioSources[0];

    this.audioPreviewHandler.audio = null;
    audioSource.getFileStats()
      .then(function (stats) {
        if (new Audio().canPlayType(stats.type) != "") {
          this.view.querySelector(".audio-on-hover").style.display = "";
          this.audioPreviewHandler.audio = audioSource.fileHandler.url;
        }
      }.bind(this));
  }
});

ExploreConversationController.defineMethod("uninitView", function uninitView() {
  if (!this.view) return;

  window.removeEventListener("blur", this.windowBlurEventListener);
  delete this.windowBlurEventListener;

  removeElementProperty(this.view, "conversation-id");
});


/**
 * ExploreConversationController
 * Concrete view controller to display a Conversation.
 * @constructor
 */
let ExploreConversationController = ConversationController.createComponent("ExploreConversationController");

ExploreConversationController.createViewFragment = function createViewFragment() {
  return cloneTemplate("#template-explore-conversation");
};

ExploreConversationController.defineAlias("model", "conversation");

(function (ExploreConversationController) {

  ExploreConversationController.defineMethod("initView", function initView() {
    if (!this.view) return;

    // Init click to display full article

    this.view.addEventListener("click", viewOnClick);

    // Init audio preview

    this.audioPreviewHandler = new AudioHandler();

    this.view.querySelector(".audio-on-hover").addEventListener("click", audioPreviewElementOnClick.bind(this.view));

    this.view.addEventListener("mouseleave", audioPreviewElementOnBlur);
    window.addEventListener("blur", audioPreviewElementOnBlur.bind(this.view));

    setElementProperty(this.view, "conversation-id", this.conversation.conversationId);
  });

  ExploreConversationController.defineMethod("updateView", function updateView() {
    if (!this.view) return;

    // Update display metadata

    this.view.querySelectorAll("[data-ica-conversation-meta]").forEach(function (element) {
      element.textContent = this.conversation.meta[getElementProperty(element, "conversation-meta")] || "";
    }.bind(this));

    // Backdrop image

    this.view.classList.remove("dark");
    let imageSources = this.conversation.imageSources;
    if (imageSources.length > 0) {
      let imageSource = imageSources[0];

      if (imageSource.content["0"]) {
        this.view.classList.add("dark");

        // TODO: Reduce duplication with fetching images
        let backdropImageElement = this.view.querySelector(".conversation-backdrop-image");
        let backgroundImage = "linear-gradient(to bottom, rgba(0, 0, 0, 0.25), rgba(0, 0, 0, 0.06) 8em)," +
          (
            imageSource.content["0"]
              ? "url(" + (
              imageSource.fileHandler.blob instanceof Blob
                ? imageSource.fileHandler.url
                : imageSource.fileHandler.url + "?width=" + (backdropImageElement.offsetWidth * this.devicePixelRatio)
                + "&height=" + (backdropImageElement.offsetHeight * this.devicePixelRatio)
            ) + ")"
              : ""
          );
        if (backdropImageElement.style.backgroundImage !== backgroundImage)
          backdropImageElement.style.backgroundImage = backgroundImage;
      }
    }

    // Audio preview

    this.view.querySelector(".audio-on-hover").style.display = "none";
    let audioSources = this.conversation.audioSources;
    if (audioSources.length > 0) {
      let audioSource = audioSources[0];

      this.audioPreviewHandler.audio = null;
      audioSource.getFileStats()
        .then(function (stats) {
          if (new Audio().canPlayType(stats.type) !== "") {
            this.view.querySelector(".audio-on-hover").style.display = "";
            this.audioPreviewHandler.audio = audioSource.fileHandler.url;
          }
        }.bind(this));
    }

    // Display order

    this.view.style.order = -this.conversation.conversationId;

  });

  ExploreConversationController.defineMethod("uninitView", function uninitView() {
    if (!this.view) return;

    // Uninit audio preview

    this.view.removeEventListener("mouseleave", audioPreviewElementOnBlur);
    window.removeEventListener("blur", audioPreviewElementOnBlur);

    this.view.querySelector(".audio-on-hover").removeEventListener("click", audioPreviewElementOnClick);

    // Uninit click to display full article

    this.view.removeEventListener("click", viewOnClick);

    removeElementProperty(this.view, "conversation-id");
  });

  // Shared functions

  function viewOnClick(event) {
    event.preventDefault();
    event.stopPropagation();

    let fragment = MapArticleConversationController.createViewFragment();
    let element = fragment.querySelector(".article-container");

    document.body.querySelector(".app-view").appendChild(fragment);
    new MapArticleConversationController(this.controller.conversation, element);
  }

  function audioPreviewElementOnClick(event) {
    event.stopPropagation();

    this.controller.audioPreviewHandler.play();
    this.querySelector(".audio-on-hover").classList.add("active");
  }

  function audioPreviewElementOnBlur() {
    this.controller.audioPreviewHandler.stop(300);
    this.querySelector(".audio-on-hover").classList.remove("active");
  }

})(ExploreConversationController);

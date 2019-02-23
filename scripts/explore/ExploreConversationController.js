
/**
 * ExploreConversationController
 * Concrete view controller to display a Conversation.
 * @constructor
 */
let ExploreConversationController = BasicConversationPresenterController.createComponent("ExploreConversationController");

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

    let audioOnHoverElement = this.view.querySelector(".audio-on-hover");
    audioOnHoverElement.addEventListener("click", audioPreviewElementOnClick);
    audioOnHoverElement.controller = this;

    this.view.addEventListener("mouseleave", audioPreviewElementOnBlur);

  });

  ExploreConversationController.defineMethod("updateView", function updateView() {
    if (!this.view) return;

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

  });

  ExploreConversationController.defineMethod("uninitView", function uninitView() {
    if (!this.view) return;

    // Uninit audio preview

    this.view.removeEventListener("mouseleave", audioPreviewElementOnBlur);

    this.view.querySelector(".audio-on-hover").removeEventListener("click", audioPreviewElementOnClick);

    // Uninit click to display full article

    this.view.removeEventListener("click", viewOnClick);

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
    this.controller.view.querySelector(".audio-on-hover").classList.add("active");
  }

  function audioPreviewElementOnBlur() {
    this.controller.audioPreviewHandler.stop(300);
    this.controller.view.querySelector(".audio-on-hover").classList.remove("active");
  }

}(ExploreConversationController));

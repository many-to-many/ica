
/**
 * BasicConversationPresenterController
 * Concrete view controller to display a Conversation.
 * @constructor
 */
let BasicConversationPresenterController = ConversationController.createComponent("BasicConversationPresenterController");

Object.assign(BasicConversationPresenterController.prototype, {

  fadeBackdrop: true,

});

BasicConversationPresenterController.defineAlias("model", "conversation");

BasicConversationPresenterController.defineMethod("init", function init() {

  // Proxy for backdrop image
  this.backdropImage = new Image();
  this.backdropImage.addEventListener("load", function () {
    if (!this.view) return;

    let backdropImageElement = this.view.querySelector(".conversation-backdrop-image");

    let backgroundImage =
      (this.fadeBackdrop ? "linear-gradient(to bottom, rgba(0, 0, 0, 0.25), rgba(0, 0, 0, 0.06) 8em)," : "") +
      ("url(" + this.backdropImage.src + ")");
    if (backdropImageElement.style.backgroundImage !== backgroundImage)
      backdropImageElement.style.backgroundImage = backgroundImage;

  }.bind(this));
  this.backdropImage.addEventListener("error", function () {
    if (!this.view) return;

    let backdropImageElement = this.view.querySelector(".conversation-backdrop-image");

    let backgroundImage = "";
    if (backdropImageElement.style.backgroundImage !== backgroundImage)
      backdropImageElement.style.backgroundImage = backgroundImage;

  }.bind(this));

});

BasicConversationPresenterController.defineMethod("updateView", function updateView() {
  if (!this.view || !this.conversation) return;

  // Update display metadata

  this.view.querySelectorAll("[data-ica-conversation-meta]").forEach(function (element) {
    element.textContent = this.conversation.meta[getElementProperty(element, "conversation-meta")] || "";
  }.bind(this));

  // Backdrop image

  let backdropImageElement = this.view.querySelector(".conversation-backdrop-image");

  this.view.classList.remove("dark");
  let imageSources = this.conversation.imageSources;
  if (imageSources.length > 0) {
    let imageSource = imageSources[0];

    if (imageSource.content["0"]) {
      this.view.classList.add("dark");

      this.backdropImage.src = imageSource.content["0"] ? (
          imageSource.fileHandler.blob instanceof Blob
            ? imageSource.fileHandler.url
            : imageSource.fileHandler.url + "?width=" + (backdropImageElement.offsetWidth * this.devicePixelRatio)
            + "&height=" + (backdropImageElement.offsetHeight * this.devicePixelRatio)
        ) : "";
    } else {
      this.backdropImage.src = "";
    }
  } else {
    this.backdropImage.src = "";
  }

});

BasicConversationPresenterController.prototype.promiseBackdropImageLoaded = function () {
  return promiseImageLoaded(this.backdropImage);
};


/**
 * MapConversationImageSourceController
 * Concrete view controller to display an image source.
 * @constructor
 */
let MapConversationImageSourceController = MapConversationSourceController.createComponent("MapConversationImageSourceController");

MapConversationImageSourceController.createViewFragment = function () {
  return cloneTemplate("#template-map-conversation-imagesource");
};

MapConversationImageSourceController.defineMethod("updateView", function updateView() {
  if (!this.view) return;

  let img = this.view.querySelector("img[data-ica-content]");
  img.src = this.source.content["0"]
    ? this.source.fileHandler.blob instanceof Blob
      ? this.source.fileHandler.url
      : this.source.fileHandler.url + "?width=" + (img.offsetWidth * this.devicePixelRatio)
    : "";
});

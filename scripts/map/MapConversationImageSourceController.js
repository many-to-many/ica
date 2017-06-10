
var MapConversationImageSourceController = MapConversationSourceController.createComponent("MapConversationImageSourceController");

MapConversationImageSourceController.createViewFragment = function (source) {
  return cloneTemplate("#template-map-conversation-imagesource");
};

MapConversationImageSourceController.defineMethod("updateView", function updateView(length = 0) {
  if (!this.view) return;

  var img = this.view.querySelector("img[data-ica-content]");
  img.src = this.source.content["0"]
    ? this.source.fileHandler.blob instanceof Blob
      ? this.source.fileHandler.url
      : this.source.fileHandler.url + "?width=" + (img.offsetWidth * this.devicePixelRatio)
    : "";
});


var ImageSourceController = SourceController.createComponent("ImageSourceController");

ImageSourceController.createViewFragment = function (source) {
  return cloneTemplate("#template-imagesource");
};

ImageSourceController.defineMethod("updateView", function updateView(length = 0) {
  if (!this.view) return;

  var img = this.view.querySelector("img[data-ica-content]");
  img.src = this.source.content
    ? this.source.blobHandler.blob instanceof Blob
      ? this.source.blobHandler.url
      : this.source.blobHandler.url + "?width=" + (img.offsetWidth * this.devicePixelRatio)
    : "";
});

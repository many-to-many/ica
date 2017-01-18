
var ImageSourceController = SourceController.createComponent("ImageSourceController");

ImageSourceController.createViewFragment = function (source) {
  return cloneTemplate("#template-imagesource");
};

ImageSourceController.defineMethod("updateView", function updateView(length = 0) {
  if (!this.view) return;

  this.view.querySelector("img[data-ica-content]").src = this.source.blobHandler.url;

});

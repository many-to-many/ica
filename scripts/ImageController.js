
/**
 * ImageController
 * Concrete view controller to display an image model.
 */
let ImageController = SingleModelController.createComponent("ImageController");

ImageController.createViewFragment = function () {
  return cloneTemplate("#template-image");
};

ImageController.defineAlias("model", "fileHandler");

ImageController.defineMethod("updateView", function () {
  if (!this.view) return;

  // Update the source of the view
  this.view.src = this.fileHandler.blob
    ? this.fileHandler.blob instanceof Blob
      ? this.fileHandler.url
      : this.fileHandler.url + "?width=" + (this.view.offsetWidth * this.devicePixelRatio)
    : "";
});

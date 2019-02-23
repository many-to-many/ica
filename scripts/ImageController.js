
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

/**
 * Returns a Promise that resolves when there is no image or the image is ready to be displayed.
 */
function promiseImageLoaded(img) {
  if (img.complete) {
    if (img.naturalHeight !== 0) {
      return Promise.resolve();
    }
    return Promise.reject(new Error("Image failed to load"));
  }

  return new Promise(function (resolve, reject) {
    function handleLoad() {
      img.removeEventListener("load", handleLoad);
      img.removeEventListener("error", handleError);
      resolve();
    }
    function handleError() {
      img.removeEventListener("load", handleLoad);
      img.removeEventListener("error", handleError);
      reject(new Error("Image failed to load"));
    }
    img.addEventListener("load", handleLoad);
    img.addEventListener("error", handleError);
  });
}

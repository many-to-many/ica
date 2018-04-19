
/**
 * MapImageSourceController
 * Concrete view controller to display an image source.
 * @constructor
 */
let MapImageSourceController = MapSourceController.createComponent("MapImageSourceController");

MapImageSourceController.createViewFragment = function createViewFragment() {
  return cloneTemplate("#template-map-imagesource");
};

MapImageSourceController.defineMethod("updateView", function updateView() {
  if (!this.view) return;

  let img = this.view.querySelector("img[data-ica-content]");
  img.src = this.source.content["0"]
    ? this.source.fileHandler.blob instanceof Blob
      ? this.source.fileHandler.url
      : this.source.fileHandler.url + "?width=" + (img.offsetWidth * this.devicePixelRatio)
    : "";
});

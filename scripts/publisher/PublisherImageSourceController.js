
/**
 * PublisherImageSourceController
 * Concrete view controller to present an image source.
 * @constructor
 */
let PublisherImageSourceController = PublisherSourceController.createComponent("PublisherImageSourceController");

PublisherImageSourceController.createViewFragment = function () {
  return cloneTemplate("#template-publisher-imagesource");
};

PublisherImageSourceController.defineMethod("initView", function () {
  if (!this.view) return;

  this.imageController = new ImageController(
    this.source.fileHandler,
    this.view.querySelector(".image"));

  this.publisherSourceDropHandler = new DropHandler(this.view, function (files) {
    this.querySelector("[data-ica-source-content]").files = files;
  }.bind(this.view));

  this.view.querySelector("[data-ica-source-content]").addEventListener("change", function (event) {
    this.controller.source.content["0"] = event.target.files[0];
    this.controller.source.didUpdate();
  }.bind(this.view));

  this.view.querySelector("[data-ica-action='select-file']").addEventListener("click", function (event) {
    event.preventDefault();

    this.view.querySelector("[data-ica-source-content]").click();
  }.bind(this));

});

PublisherImageSourceController.defineMethod("uninitView", function () {
  if (!this.view) return;

  this.imageController.destroy();
  delete this.imageController;

  this.publisherSourceDropHandler.destroy();
  delete this.publisherSourceDropHandler;

});


var PublisherImageSourceController = PublisherSourceController.createComponent("PublisherImageSourceController");

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

  this.view.querySelector("[data-ica-source-content]").addEventListener("change", function (e) {
    var file = e.target.files[0];
    this.controller.source.content["0"] = file;
    this.controller.source.didUpdate();
  }.bind(this.view));

  this.view.querySelector("[data-ica-action='select-file']").addEventListener("click", function (e) {
    e.preventDefault();

    this.view.querySelector("[data-ica-source-content]").click();
  }.bind(this));

});

PublisherImageSourceController.defineMethod("updateView", function () {
  if (!this.view) return;

  var input = this.view.querySelector("[data-ica-source-content]");

});

PublisherImageSourceController.defineMethod("uninitView", function () {
  if (!this.view) return;

  this.imageController.destroy();
  delete this.imageController;

  this.publisherSourceDropHandler.destroy();
  delete this.publisherSourceDropHandler;

});


var PublisherVideoSourceController = PublisherSourceController.createComponent("PublisherVideoSourceController");

PublisherVideoSourceController.createViewFragment = function () {
  return cloneTemplate("#template-publisher-videosource");
};

PublisherVideoSourceController.defineMethod("initView", function () {
  if (!this.view) return;

  this.publisherSourceDropHandler = new DropHandler(this.view, function (files) {
    this.querySelector("[data-ica-source-content]").files = files;
  }.bind(this.view));

  this.view.querySelector("[data-ica-source-content]").addEventListener("change", function (e) {
    var file = e.target.files[0];
    this.controller.source.content = file;
    this.controller.source.didUpdate();
  }.bind(this.view));

  this.view.querySelector("[data-ica-action='select-file']").addEventListener("click", function (e) {
    e.preventDefault();

    this.view.querySelector("[data-ica-source-content]").click();
  }.bind(this));

});

PublisherVideoSourceController.defineMethod("updateView", function () {
  if (!this.view) return;

  var input = this.view.querySelector("[data-ica-source-content]");

});

PublisherVideoSourceController.defineMethod("uninitView", function () {
  if (!this.view) return;

  this.publisherSourceDropHandler.destroy();
  delete this.publisherSourceDropHandler;

});

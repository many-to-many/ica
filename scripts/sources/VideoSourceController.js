
var VideoSourceController = SourceController.createComponent("VideoSourceController");

VideoSourceController.createViewFragment = function (source) {
  return cloneTemplate("#template-videosource");
};

VideoSourceController.defineMethod("updateView", function updateView() {
  if (!this.view) return;

  this.view.querySelector("[data-ica-content]").src = this.source.blobHandler.url;

});

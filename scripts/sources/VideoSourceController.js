
var VideoSourceController = SourceController.createComponent("VideoSourceController");

VideoSourceController.createViewFragment = function (source) {
  return cloneTemplate("#template-videosource");
};

VideoSourceController.defineMethod("updateView", function updateView() {
  if (!this.view) return;

  this.view.querySelector("a[data-ica-content]").textContent = this.source.blobHandler.url;
  this.view.querySelector("a[data-ica-content]").href = this.source.blobHandler.url;

});


var AudioSourceController = SourceController.createComponent("AudioSourceController");

AudioSourceController.createViewFragment = function (source) {
  return cloneTemplate("#template-audiosource");
};

AudioSourceController.defineMethod("updateView", function updateView() {
  if (!this.view) return;

  this.view.querySelector("a[data-ica-content]").textContent = this.source.blobHandler.url;
  this.view.querySelector("a[data-ica-content]").href = this.source.blobHandler.url;

});

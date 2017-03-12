
var AudioSourceController = SourceController.createComponent("AudioSourceController");

AudioSourceController.createViewFragment = function (source) {
  return cloneTemplate("#template-audiosource");
};

AudioSourceController.defineMethod("updateView", function updateView() {
  if (!this.view) return;

  this.view.querySelector("[data-ica-content]").src = this.source.blobHandler.url;

});

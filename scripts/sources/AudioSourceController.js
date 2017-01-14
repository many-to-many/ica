
var AudioSourceController = SourceController.createComponent("AudioSourceController");

AudioSourceController.createViewFragment = function (source) {
  return cloneTemplate("#template-audiosource");
};

AudioSourceController.defineMethod("updateView", function updateView(length = 0) {
  if (!this.view) return;

  this.view.querySelector("a[data-ica-content]").textContent = "streams/files/" + this.source.content;
  this.view.querySelector("a[data-ica-content]").href = "streams/files/" + this.source.content;

});

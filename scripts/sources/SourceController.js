
var SourceController = SingleModelController.createComponent("SourceController");

SourceController.defineAlias("model", "source");

SourceController.defineMethod("initView", function updateView() {
  if (!this.view) return;

  setElementProperty(this.view, "source-id", this.source.sourceId);
});

SourceController.defineMethod("uninitView", function uninitView() {
  if (!this.view) return;

  removeElementProperty(this.view, "source-id");
});

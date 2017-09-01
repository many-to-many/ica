
/**
 * SourceController
 * Abstract controller to display each individual source.
 */
let SourceController = SingleModelController.createComponent("SourceController");

SourceController.defineAlias("model", "source");

// View

SourceController.defineMethod("updateView", function updateView() {
  if (!this.view) return;

  setElementProperty(this.view, "source-id", this.source.sourceId);

});

SourceController.defineMethod("uninitView", function uninitView() {
  if (!this.view) return;

  removeElementProperty(this.view, "source-id");
});

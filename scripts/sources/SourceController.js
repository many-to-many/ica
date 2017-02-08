
var SourceController = SingleModelController.createComponent("SourceController");

SourceController.defineAlias("model", "source");

SourceController.defineMethod("initView", function initView() {
  if (!this.view) return;

  // setElementProperty(this.view, "source-id", this.source.sourceId);

  this.view.addEventListener("click", function (e) {
    // e.preventDefault();
    e.stopPropagation();
  });
});

SourceController.defineMethod("updateView", function updateView() {
  if (!this.view) return;

  setElementProperty(this.view, "source-id", this.source.sourceId);

});

SourceController.defineMethod("uninitView", function uninitView() {
  if (!this.view) return;

  removeElementProperty(this.view, "source-id");
});

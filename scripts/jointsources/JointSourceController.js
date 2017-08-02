
var JointSourceController = SingleModelController.createComponent("JointSourceController");

JointSourceController.defineAlias("model", "jointSource");

// View

JointSourceController.defineMethod("initView", function updateView() {
  if (!this.view) return;

  setElementProperty(this.view, "jointsource-id", this.jointSource.jointSourceId);
});

JointSourceController.defineMethod("uninitView", function initView() {
  if (!this.view) return;

  removeElementProperty(this.view, "jointsource-id");
});

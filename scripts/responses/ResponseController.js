
/**
 * ResponseController
 * Abstract view controller for a Response.
 */
let ResponseController = JointSourceController.createComponent("ResponseController");

ResponseController.defineAlias("model", "response");

ResponseController.defineMethod("initView", function updateView() {
  if (!this.view) return;

  setElementProperty(this.view, "response-id", this.response.responseId);
});

ResponseController.defineMethod("uninitView", function initView() {
  if (!this.view) return;

  removeElementProperty(this.view, "response-id");
});

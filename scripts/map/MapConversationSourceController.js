
var MapConversationSourceController = SourceController.createComponent("MapConversationSourceController");

MapConversationSourceController.defineMethod("initView", function initView() {
  if (!this.view) return;

  this.view.querySelector("[data-ica-action='edit-conversation']").addEventListener("click", function (e) {
    e.preventDefault();
    this.controller.componentOf.displayPublisherConversationView();
  }.bind(this.view));

  this.view.addEventListener("click", function (e) {
    // e.preventDefault();
    e.stopPropagation();
  });
});

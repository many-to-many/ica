
var MapConversationSourceController = SourceController.createComponent("MapConversationSourceController");

MapConversationSourceController.defineMethod("initView", function initView() {
  if (!this.view) return;

  let editConversationAnchor = this.view.querySelector("[data-ica-action='edit-conversation']");
  editConversationAnchor.href = "/conversations/{0}/edit".format(this.source.jointSource.conversationId);
  editConversationAnchor.addEventListener("click", function (event) {
    event.preventDefault();

    this.controller.componentOf.displayPublisherConversationView();
  }.bind(this.view));

  this.view.addEventListener("click", function (e) {
    // e.preventDefault();
    e.stopPropagation();
  });
});

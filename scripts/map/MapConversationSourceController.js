
/**
 * MapConversationSourceController
 * Abstract view controller to display a source model.
 * @constructor
 */
let MapConversationSourceController = SourceController.createComponent("MapConversationSourceController");

(function (MapConversationSourceController) {

  MapConversationSourceController.defineMethod("initView", function initView() {
    if (!this.view) return;

    this.view.addEventListener("click", viewOnClick);

    let editConversationAnchor = this.view.querySelector("[data-ica-action='edit-conversation']");
    editConversationAnchor.href = "/conversations/{0}/edit".format(this.source.jointSource.conversationId);
    editConversationAnchor.addEventListener("click", editConversationAnchorOnClick);
    editConversationAnchor.controller = this;

  });

  MapConversationSourceController.defineMethod("uninitView", function uninitView() {
    if (!this.view) return;

    this.view.querySelector("[data-ica-action='edit-conversation']").removeEventListener("click", editConversationAnchorOnClick);

    this.view.removeEventListener("click", viewOnClick);

  });

  // Shared functions

  function viewOnClick(event) {
    event.stopPropagation();
  }

  function editConversationAnchorOnClick(event) {
    event.preventDefault();

    this.controller.componentOf.displayPublisherConversationView();
  }

}(MapConversationSourceController));

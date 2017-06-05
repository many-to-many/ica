
var ExploreController = SingleModelController.createComponent("ExploreController");

ExploreController.defineAlias("model", "explore");

ExploreController.defineMethod("initView", function initView() {
  if (!this.view) return;

  this.viewItems = [];

  setElementProperty(this.view, "explore-id", this.explore.exploreId);
});

ExploreController.defineMethod("updateView", function updateView() {
  if (!this.view) return;

  this.viewItems = this.viewItems.filter(function (item) {
    if (this.explore.items.indexOf(item) > -1) return true;

    switch (item.constructor) {
    case Conversation:
      var conversation = item;

      var element = this.view.querySelector("[data-ica-conversation-id='{0}']".format(conversation.conversationId));
      if (element) {
        element.controller.destroy(true);
      }
      break;
    }

    return false;
  }.bind(this));

  this.explore.items.reverse().map(function (item) {
    switch (item.constructor) {
    case Conversation:
      var conversation = item;
      // Check existing element
      if (this.view.querySelector("[data-ica-conversation-id='{0}']".format(conversation.conversationId))) return;

      // Create new view
      var fragment = ExploreConversationController.createViewFragment();
      var element = fragment.querySelector(".conversation");
      this.view.insertBefore(fragment, this.firstChild);
      new ExploreConversationController(conversation, element).componentOf = this.controller;

      this.viewItems.push(item);

      break;
    default:
      console.warn("Unhandled item:", item.constructor);
    }
  }.bind(this));
});

ExploreController.defineMethod("uninitView", function initView() {
  if (!this.view) return;

  delete this.viewItems;

  removeElementProperty(this.view, "explore-id");
});


var ConversationController = JointSourceController.createComponent("ConversationController");

ConversationController.defineAlias("model", "conversation");

ConversationController.defineMethod("initView", function updateView() {
  if (!this.view) return;

  setElementProperty(this.view, "conversation-id", this.conversation.conversationId);
});

ConversationController.defineMethod("uninitView", function initView() {
  if (!this.view) return;

  removeElementProperty(this.view, "conversation-id");
});


/**
 * ConversationController
 * Abstract view controller for a Conversation.
 * @constructor
 */
let ConversationController = JointSourceController.createComponent("ConversationController");

ConversationController.defineAlias("model", "conversation");

ConversationController.defineMethod("initView", function initView() {
  if (!this.view || !this.conversation) return;

  setElementProperty(this.view, "conversation-id", this.conversation.conversationId);
});

ConversationController.defineMethod("uninitView", function uninitView() {
  if (!this.view) return;

  removeElementProperty(this.view, "conversation-id");
});


/**
 * DiscussionController
 * Abstract view controller for a Discussion.
 * @constructor
 */
let DiscussionController = JointSourceController.createComponent("DiscussionController");

DiscussionController.defineAlias("model", "discussion");

DiscussionController.defineMethod("initView", function initView() {
  if (!this.view) return;

  setElementProperty(this.view, "discussion-id", this.discussion.discussionId);
});

DiscussionController.defineMethod("uninitView", function uninitView() {
  if (!this.view) return;

  removeElementProperty(this.view, "discussion-id");
});

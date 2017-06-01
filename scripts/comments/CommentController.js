
var CommentController = SingleModelController.createComponent("CommentController");

CommentController.defineAlias("model", "comment");

CommentController.defineMethod("updateView", function updateView() {
  if (!this.view) return;

  setElementProperty(this.view, "comment-id", this.comment.commentId);

});

CommentController.defineMethod("uninitView", function uninitView() {
  if (!this.view) return;

  removeElementProperty(this.view, "comment-id");
});

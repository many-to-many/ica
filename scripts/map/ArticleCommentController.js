
var ArticleCommentController = CommentController.createComponent("ArticleCommentController");

ArticleCommentController.createViewFragment = function () {
  return cloneTemplate("#template-article-comment");
};

// Model

ArticleCommentController.defineMethod("initModel", function initModel() {
  if (!this.model) return;
  this.comment.backup();
});

ArticleCommentController.defineMethod("uninitModel", function uninitModel() {
  if (!this.model) return;
  this.comment.recover();
  this.comment.didUpdate();
});

// View

ArticleCommentController.defineMethod("initView", function updateView() {
  if (!this.view) return;

  var editor = this.view.querySelector("[data-ica-comment-content]");
  this.quill = new Quill(editor, {
    modules: {
      toolbar: false
    },
    theme: "",
    placeholder: this.comment.commentId < 0 ? "Post a new comment here..." : ""
  });
  this.quill.on("text-change", function (delta, oldDelta, source) {
    if (source == "user") {
      this.comment.content["0"] = this.quill.getText().replace(/\s*\n$/, "");
    }
    this.view.querySelector("[data-ica-action='publish-comment']").hidden = !this.comment.content["0"] || !this.comment.isContentUpdated();
  }.bind(this));

  if (this.comment.authorId != ICA.accountId) {
    this.quill.enable(false);
  }

  this.view.querySelector("[data-ica-action='publish-comment']").hidden = true;

  this.view.querySelector("[data-ica-action='publish-comment']").addEventListener("click", function (e) {
    e.preventDefault();

    this.controller.publish();
  }.bind(this.view));
});

ArticleCommentController.defineMethod("updateView", function updateView() {
  if (!this.view) return;

  this.view.classList.toggle("draft", this.comment.commentId < 0);

  this.quill.setText(this.comment.content["0"] ? this.comment.content["0"] : "");

  this.view.querySelector("[data-ica-timestamp='authored']").textContent = this.comment.timestampAuthored
    ? new Date(this.comment.timestampAuthored * 1000) .toLocaleDateString("en-us")
    : "Draft";

  if (this.comment.authorId) {
    this.comment.getAuthor()
      .then(function (author) {
        if (!this.view) return;

        this.view.querySelector("[data-ica-author]").textContent = (author.name || "Anonymous")
          + (author.authorId == ICA.accountId ? " (me)" : "");
      }.bind(this));
  } else {
    this.view.querySelector("[data-ica-author]").textContent = "Anonymous (me)";
  }
});

ArticleCommentController.defineMethod("uninitView", function uninitView() {
  if (!this.view) return;

  delete this.quill;
});

ArticleCommentController.prototype.publish = function () {
  return this.comment.publish("Publishing comment...")
    .then(function (comment) {

      this.updateView();
      this.componentOf.updateView(); // Signal creating new temporary comment instance

      // Display notification
      notifications.addNotification(new BasicNotification("Comment published!"));
      notifications.didUpdate();

    }.bind(this))
    .catch(function (err) {
      console.warn(err);

      // Display notification
      notifications.addNotification(new BasicNotification("Failed to publish comment", err ? err.message : undefined));
      notifications.didUpdate();
    });
};

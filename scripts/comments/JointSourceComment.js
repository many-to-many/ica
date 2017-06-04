
var JointSourceComment = Comment.createComponent("JointSourceComment");

JointSourceComment.defineMethod("init", function init(content, jointSource, commentId, authorId, timestampAuthored) {
  // Init commentId
  if (!this.commentId) {
    this._commentId = commentId || - ++Comment.comments.count;
    this.initCommentId();
  }
  // Init jointSource
  this._jointSource = jointSource;
  this.initJointSource();
  return [content, commentId, authorId, timestampAuthored];
});

// JointSource

Object.defineProperty(JointSourceComment.prototype, "jointSource", {
  get: function () {
    return this._jointSource;
  },
  set: function (value) {
    if (this._jointSource == value) return;
    this.uninitJointSource();
    this._jointSource = value;
    this.initJointSource();
  }
});

JointSourceComment.defineMethod("initJointSource", function initJointSource() {
  if (!this.jointSource) return;
  this.jointSource.comments[this.commentId] = this;
});

JointSourceComment.defineMethod("uninitJointSource", function uninitJointSource() {
  if (!this.jointSource) return;
  delete this.jointSource.comments[this.commentId];
});

// CommentId

JointSourceComment.defineMethod("initCommentId", function initCommentId() {
  if (!this.commentId) return;
  this.initJointSource();
});

JointSourceComment.defineMethod("uninitCommentId", function uninitCommentId() {
  if (!this.commentId) return;
  this.uninitJointSource();
});

// Article

JointSourceComment.prototype.publish = function (notify) {
  return ICA.publishJointSourceComment(this, notify)
    .then(function (comment) {
      this.backup(true);

      return comment;
    }.bind(this));
};

JointSourceComment.prototype.cloneContent = function () {
  // Clone an object
  var clone = this.content.constructor();
  for (var key in this.content) {
    if (this.content.hasOwnProperty(key)) {
      clone[key] = this.content[key];
    }
  }
  return clone;
};

JointSourceComment.prototype.isContentUpdated = function () {
  if (!this._backup_content) return false; // Cannot know if without backup
  return !equals(this.content, this._backup_content);
};

JointSourceComment.prototype.backup = function (force = false) {
  // Backup original for user editing
  if (!this._backup_content || force) {
    this._backup_content = this.cloneContent();
  }
};

JointSourceComment.prototype.recover = function () {
  if (this._backup_content) {
    this.content = this._backup_content;
    delete this._backup_content;
  }
};

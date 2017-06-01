
var Comment = Model.createComponent("Comment");

Comment.comments = {count: 0};

Comment.defineMethod("init", function init(content, commentId, authorId, timestampAuthored) {
  // Init commentId
  if (!this.commentId) {
    this._commentId = commentId || - ++Comment.comments.count;
    this.initCommentId();
  }
  // Init authorId
  this._authorId = authorId;
  // Init timestampAuthored
  this._timestampAuthored = timestampAuthored;
  // Init content
  this.content = content || {};
  return [];
});

Comment.defineMethod("uninit", function uninit() {
  // Uninit content
  delete this.content;
  // Uninit authorId
  delete this._authorId;
  // Uninit commentId
  this.uninitCommentId();
  delete this._commentId;
});

// CommentId

Object.defineProperty(Comment.prototype, "commentId", {
  get: function () {
    return this._commentId;
  },
  set: function (value) {
    if (this._commentId == value) return;
    this.uninitCommentId();
    this._commentId = value;
    this.initCommentId();
  }
});

Comment.defineMethod("initCommentId", function initCommentId() {
  if (!this.commentId) return;
  Comment.comments[this.commentId] = this;
});

Comment.defineMethod("uninitCommentId", function uninitCommentId() {
  if (!this.commentId) return;
  delete Comment.comments[this.commentId];
});

// AuthorId

Object.defineProperty(Comment.prototype, "authorId", {
  get: function () {
    return this._authorId || ICA.accountId;
  },
  set: function (value) {
    if (value == this._authorId) return;
    this._authorId = value;
  }
});

Comment.prototype.getAuthor = function () {
  return ICA.getAuthor(this.authorId);
};

// TimestampAuthored

Object.defineProperty(Comment.prototype, "timestampAuthored", {
  get: function () {
    return this._timestampAuthored || 0;
  },
  set: function (value) {
    if (value == this._timestampAuthored) return;
    this._timestampAuthored = value;
  }
});

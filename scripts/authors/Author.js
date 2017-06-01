
var Author = Model.createComponent("Author");

Author.authors = {};

Author.defineMethod("init", function init(authorId) {
  // Init authorId
  this._authorId = authorId;
  this.initAuthorId();
  return [];
});

Author.defineMethod("uninit", function uninit() {
  // Uninit authorId
  this.uninitAuthorId();
  delete this._authorId;
});

// AuthorId

Object.defineProperty(Author.prototype, "authorId", {
  get: function () {
    return this._authorId;
  },
  set: function (value) {
    if (this._authorId == value) return;
    this.uninitAuthorId();
    this._authorId = value;
    this.initAuthorId();
  }
});

Author.defineMethod("initAuthorId", function initAuthorId() {
  if (!this.authorId) return;
  Author.authors[this.authorId] = this;
});

Author.defineMethod("uninitAuthorId", function uninitAuthorId() {
  if (!this.authorId) return;
  delete Author.authors[this.authorId];
});

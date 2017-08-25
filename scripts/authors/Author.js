
let Author = Model.createComponent("Author");

Author.authors = {};

Author.defineMethod("init", function init(authorId, name) {

  // Init authorId
  this._authorId = authorId;
  this.initAuthorId();

  // Init name
  this._name = name;

  return [];
});

Author.defineMethod("uninit", function uninit() {

  // Uninit name

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
    if (value === this._authorId) return;
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

// Name

Object.defineProperty(Author.prototype, "name", {
  get: function () {
    return this._name || "Anonymous";
  },
  set: function (value) {
    if (value === this._name) return;
    this._name = value;
  }
});

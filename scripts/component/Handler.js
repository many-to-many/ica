
let Handler = Model.createComponent("Handler");

Handler.defineMethod("init", function init(content) {
  // Init content
  this._content = content;
  this.initContent();
});

Handler.defineMethod("uninit", function () {
  // Uninit content
  this.uninitContent();
  delete this._content;
});

// Content

Object.defineProperty(Handler.prototype, "content", {
  get: function () {
    return this._content;
  },
  set: function (value) {
    if (this._content === value) return;
    this.uninitContent();
    this._content = value;
    this.initContent();
  }
});

Handler.defineMethod("initContent", function () {
  if (!this.content) return;
  this.content.handler = this;
});

Handler.defineMethod("contentDidUpdate", function () {
  this.didUpdate();
});

Handler.defineMethod("uninitContent", function () {
  if (!this.content) return;
  delete this.content.handler;
});

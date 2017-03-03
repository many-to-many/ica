
var TokenInputHandler = ElementHandler.createComponent("TokenInputHandler");

TokenInputHandler.defineAlias("element", "input");

TokenInputHandler.defineMethod("initContent", function initContent() {
  if (!this.input) return;

  this.input.addEventListener("blur", TokenInputHandler.inputUpdated);
});

TokenInputHandler.defineMethod("uninitContent", function uninitContent() {
  if (!this.input) return;

  // TODO: Remove event listeners
});

TokenInputHandler.inputUpdated = function inputUpdated(e) {
  this.handler.contentDidUpdate();
};

Object.defineProperty(TokenInputHandler.prototype, "tokens", {
  get: function () {
    var str = this.input.value;
    var lines = str.split("\n");
    return [].concat.apply([], lines.map(function (line) {
      // Ref: http://stackoverflow.com/questions/7695997/split-the-sentences-by-and-remove-surrounding-spaces
      var tokens = line.match(/(?=\S)[^;]+?(?=\s*(;|$))/g) || [];
      return tokens;
    }))
      .filter(function (token, index, self) {
        return index == self.indexOf(token);
      });
  },
  set: function (tokens) {
    this.input.value = tokens ? tokens.join("; ") : "";
  }
});

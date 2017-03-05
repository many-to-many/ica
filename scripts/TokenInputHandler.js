
var TokenInputHandler = InputHandler.createComponent("TokenInputHandler");

TokenInputHandler.prototype.removeToken = function removeToken(token) {
  var tokens = this.tokens;
  var index = tokens.indexOf(token);
  if (index > -1) {
    tokens.splice(index, 1);
    this.tokens = tokens;
  }
};

TokenInputHandler.prototype.addToken = function addToken(token) {
  var tokens = this.tokens;
  var index = tokens.indexOf(token);
  if (index == -1) {
    tokens.push(token);
    this.tokens = tokens;
  }
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
    this.input.dispatchEvent(new Event("ica-change"));
  }
});

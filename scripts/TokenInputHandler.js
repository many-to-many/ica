
/**
 * TokenInputHandler
 * Handler for an input box of a list of tokens.
 * @constructor
 */
let TokenInputHandler = InputHandler.createComponent("TokenInputHandler");

TokenInputHandler.prototype.removeToken = function removeToken(token) {
  let tokens = this.tokens;
  let index = tokens.indexOf(token);
  if (index > -1) {
    tokens.splice(index, 1);
    this.tokens = tokens;
  }
};

TokenInputHandler.prototype.addToken = function addToken(token) {
  let tokens = this.tokens;
  let index = tokens.indexOf(token);
  if (index === -1) {
    tokens.push(token);
    this.tokens = tokens;
  }
};

Object.defineProperty(TokenInputHandler.prototype, "tokens", {
  get: function () {
    let str = this.input.value;
    let lines = str.split("\n");
    return [].concat.apply([], lines.map(function (line) {
      // Ref: http://stackoverflow.com/questions/7695997/split-the-sentences-by-and-remove-surrounding-spaces
      return line.match(/(?=\S)[^;]+?(?=\s*(;|$))/g) || [];
    }))
      .filter(function (token, index, self) {
        return index === self.indexOf(token);
      });
  },
  set: function (tokens) {
    this.input.value = tokens ? tokens.join("; ") : "";
    this.input.dispatchEvent(new Event("ica-change"));
  }
});


var InputHandler = ElementHandler.createComponent("InputHandler");

InputHandler.defineAlias("element", "input");

InputHandler.defineMethod("initContent", function initContent() {
  if (!this.input) return;

  this.input.addEventListener("change", InputHandler.inputUpdated);
});

InputHandler.inputUpdated = function inputUpdated(e) {
  this.handler.contentDidUpdate();
};

// TODO: Remove event listeners
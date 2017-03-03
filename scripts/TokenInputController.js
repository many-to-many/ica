
var TokenInputController = SingleModelController.createComponent("TokenInputController");

TokenInputController.createViewFragment = function () {
  return cloneTemplate("#template-tokens-editable");
}

TokenInputController.defineAlias("model", "inputHandler");

TokenInputController.defineMethod("uninitModel", function uninitModel() {
  if (!this.inputHandler) return;

  this.inputHandler.input.style.display = "";
});

TokenInputController.defineMethod("updateView", function updateView(edit = false) {
  if (!this.view) return;

  var parentNode = this.view.parentNode;
  var tokenInputFragment = TokenInputController.createViewFragment()
  var tokenInputElement = tokenInputFragment.querySelector(".tokens");
  parentNode.replaceChild(tokenInputFragment, this.view);
  this.uninitView();
  this._view = tokenInputElement;
  this.initView(false);

  if (this.inputHandler.tokens.length && !edit) {
    this.inputHandler.tokens.map(function (token) {
      var tokenFragment = cloneTemplate("#template-token-editable");
      var tokenElement = tokenFragment.querySelector(".token");

      tokenElement.querySelector("[data-ica-token]").textContent = token;

      tokenElement.querySelector("[data-ica-action='remove-token']").addEventListener("click", function (e) {
        e.preventDefault();
        e.stopPropagation();

        this.controller.inputHandler.removeToken(token);
        this.controller.inputHandler.didUpdate();
      }.bind(this));

      this.appendChild(tokenFragment);
    }.bind(this.view));

    this.view.addEventListener("click", function (e) {
      e.stopPropagation();

      this.controller.updateView(true);
    }.bind(this.view));

    // Hide input
    this.inputHandler.input.style.display = "none";
  } else {
    // Display input
    this.inputHandler.input.style.display = "";
    if (edit) {
      this.inputHandler.input.focus();
      this.inputHandler.input.selectionStart = this.inputHandler.input.selectionEnd = this.inputHandler.input.value.length; // Move the seleciton to the end of the line
    }
    // Hide tokens
    this.view.style.display = "none";
  }

  return [];

});

TokenInputController.defineMethod("uninitView", function uninitView() {
  if (!this.view) return;

  this.view.style.display = "none";
});

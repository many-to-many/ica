
/**
 * TokenInputSuggestionsController
 * Empty concrete view controller to suggest tokens to add to an InputHandler.
 * @constructor
 */
let TokenInputSuggestionsController = SingleModelController.createComponent("TokenInputSuggestionsController");

TokenInputSuggestionsController.createViewFragment = function () {
  return cloneTemplate("#template-tokens");
};

TokenInputSuggestionsController.defineAlias("model", "inputHandler");

TokenInputSuggestionsController.defineMethod("construct", function construct() {

  this.suggestions = [];

});

TokenInputSuggestionsController.defineMethod("updateView", function updateView() {
  if (!this.view) return;

  let parentNode = this.view.parentNode;
  let fragment = TokenInputSuggestionsController.createViewFragment();
  let element = fragment.querySelector(".tokens");
  parentNode.replaceChild(fragment, this.view);
  this.uninitView();
  this._view = element;
  this.initView(false);

  let inputTokens = this.inputHandler.tokens;

  if (this.suggestions.length) {
    this.suggestions.map(function (token) {
      if (inputTokens.indexOf(token) > -1) return;

      let fragment = cloneTemplate("#template-token-suggestion");
      let element = fragment.querySelector(".token");

      element.querySelector("[data-ica-token]").textContent = token;

      element.querySelector("[data-ica-action='add-token']").addEventListener("click", function (e) {
        e.preventDefault();
        e.stopPropagation();

        this.controller.inputHandler.addToken(token);
        this.controller.inputHandler.didUpdate();
      }.bind(this));

      this.appendChild(fragment);
    }.bind(this.view));

    this.view.addEventListener("click", function (e) {
      e.stopPropagation();

    }.bind(this.view));
  }
});

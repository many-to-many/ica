
var TokenInputSuggestionsController = SingleModelController.createComponent("TokenInputSuggestionsController");

TokenInputSuggestionsController.createViewFragment = function () {
  return cloneTemplate("#template-tokens");
};

TokenInputSuggestionsController.defineAlias("model", "inputHandler");

TokenInputSuggestionsController.defineMethod("construct", function construct() {

  this.suggestions = [];

});

TokenInputSuggestionsController.defineMethod("updateView", function updateView() {
  if (!this.view) return;

  var parentNode = this.view.parentNode;
  var fragment = TokenInputSuggestionsController.createViewFragment();
  var element = fragment.querySelector(".tokens");
  parentNode.replaceChild(fragment, this.view);
  this.uninitView();
  this._view = element;
  this.initView(false);

  var inputTokens = this.inputHandler.tokens;

  if (this.suggestions.length) {
    this.suggestions.map(function (token) {
      if (inputTokens.indexOf(token) > -1) return;

      var fragment = cloneTemplate("#template-token-suggestion");
      var element = fragment.querySelector(".token");

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

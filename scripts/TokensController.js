
var TokensController = SingleModelController.createComponent("TokensController");

TokensController.createViewFragment = function () {
  return cloneTemplate("#template-tokens");
};

TokensController.defineAlias("model", "tokensHandler");

TokensController.defineMethod("updateView", function updateView() {
  if (!this.view) return;

  var parentNode = this.view.parentNode;
  var fragment = TokensController.createViewFragment();
  var element = fragment.querySelector(".tokens");
  parentNode.replaceChild(fragment, this.view);
  this.uninitView();
  this._view = element;
  this.initView(false);

  if (this.tokensHandler.tokens) {
    this.tokensHandler.tokens.map(function (token) {
      var tokenFragment = cloneTemplate("#template-token");
      var tokenElement = tokenFragment.querySelector(".token");

      tokenElement.querySelector("[data-ica-token]").textContent = token;

      this.appendChild(tokenFragment);
    }.bind(this.view));
  }

  return [];

});

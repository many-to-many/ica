
/**
 * TokensController
 * Concrete view controller to display the tokens from a TokensHandler.
 * @constructor
 */
let TokensController = SingleModelController.createComponent("TokensController");

TokensController.createViewFragment = function () {
  return cloneTemplate("#template-tokens");
};

TokensController.defineAlias("model", "tokensHandler");

TokensController.defineMethod("updateView", function updateView() {
  if (!this.view) return;

  let parentNode = this.view.parentNode;
  let fragment = TokensController.createViewFragment();
  let element = fragment.querySelector(".tokens");
  parentNode.replaceChild(fragment, this.view);
  this.uninitView();
  this._view = element;
  this.initView(false);

  if (this.tokensHandler.tokens) {
    this.tokensHandler.tokens.map(function (token) {
      let tokenFragment = cloneTemplate("#template-token");
      let tokenElement = tokenFragment.querySelector(".token");

      tokenElement.querySelector("[data-ica-token]").textContent = token;

      this.appendChild(tokenFragment);
    }.bind(this.view));
  }

  return [];

});

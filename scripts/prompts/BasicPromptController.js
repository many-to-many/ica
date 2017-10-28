
/**
 * BasicPromptController
 * Concrete view controller to display a basic prompt.
 * @constructor
 */
let BasicPromptController = PromptController.createComponent("BasicPromptController");

BasicPromptController.createViewFragment = function () {
  return cloneTemplate("#template-prompt-basic");
};

BasicPromptController.defineMethod("updateView", function updateView() {
  if (!this.view) return;

  this.view.querySelectorAll("[data-ica-prompt]").forEach(function (element) {
    element.textContent = this.prompt[getElementProperty(element, "prompt")];
  }.bind(this));
});

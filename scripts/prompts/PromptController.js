
var PromptController = SingleModelController.createComponent("PromptController");

PromptController.defineAlias("model", "prompt");

// View

PromptController.defineMethod("initView", function () {
  if (!this.view) return;

  // List to keep track of (shared) actions on display
  this.viewActions = [];

  this.lockBodyScrolling();
});

PromptController.defineMethod("updateView", function () {
  if (!this.view) return;

  this.viewActions = this.viewActions.filter(function (action) {
    if (this.prompt.actions.indexOf(action) > -1) return true;

    var element = this.view.querySelector("[data-ica-action-id='{0}']".format(action.componentId));
    if (element) {
      element.controller.destroy(true);
    }
  }.bind(this));

  for (let action of this.prompt.actions) {
    var element = this.view.querySelector("[data-ica-action-id='{0}']".format(action.componentId));
    if (!element) {
      // Create new view
      var fragment = cloneTemplate("#template-prompt-action");
      element = fragment.querySelector(".action");
      this.view.querySelector(".actions").appendChild(fragment);

      element.addEventListener("click", function () {
        // Trigger prompt action
        if (action.func() !== false) {
          // Only destroy prompt if the function returns something other than false
          this.prompt.destroy(true, true);
        }
      }.bind(this));

      this.viewActions.push(action);
    }

    element.value = action.name;
    element.classList.toggle("color-primary", !!action.highlight);
  }
});


/**
 * Prompt
 * Abstract model for a prompt.
 * @constructor
 */
let Prompt = Model.createComponent("Prompt");

Prompt.defineMethod("init", function init(actions = [
  new PromptAction("Continue", function () {}, true)
]) {

  this.actions = actions;

});


/**
 * PromptAction
 * @constructor
 */
let PromptAction = Model.createComponent("PromptAction");

PromptAction.defineMethod("init", function init(name, func, highlight = false) {

  this.name = name;
  this.func = func;
  this.highlight = highlight;

});

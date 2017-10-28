
/**
 * BasicPrompt
 * Concrete model for a basic prompt.
 * @constructor
 */
let BasicPrompt = Prompt.createComponent("BasicPrompt");

BasicPrompt.defineMethod("init", function init(title, message, actions) {

  this.title = title;
  this.message = message;

  return [actions];

});



function promptBasicContinue(title, message) {
  return new Promise(function (resolve) {
    let prompt = new BasicPrompt(title, message, [
      new PromptAction(
        "Continue",
        function () {
          resolve();
        },
        true
      )
    ]);
    let fragment = BasicPromptController.createViewFragment();
    let element = fragment.querySelector(".prompt");
    document.body.appendChild(fragment);
    new BasicPromptController(prompt, element);
  });
}


var BasicPrompt = Prompt.createComponent("BasicPrompt");

BasicPrompt.defineMethod("init", function init(title, message, actions) {

  this.title = title;
  this.message = message;

  return [actions];

});

/***/

function promptBasicContinue(title, message) {
  return new Promise(function (resolve, reject) {
    var prompt = new BasicPrompt(title, message, [
      new PromptAction(
        "Continue",
        function () {
          resolve();
        },
        true
      )
    ]);
    var fragment = BasicPromptController.createViewFragment();
    var element = fragment.querySelector(".prompt");
    document.body.appendChild(fragment);
    new BasicPromptController(prompt, element);
  });
}

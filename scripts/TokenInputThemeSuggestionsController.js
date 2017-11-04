
/**
 * TokenInputThemeSuggestionsController
 * Concrete view controller to suggest tokens to add to an InputHandler.
 * @constructor
 */
let TokenInputThemeSuggestionsController = TokenInputSuggestionsController.createComponent("TokenInputThemeSuggestionsController");

TokenInputThemeSuggestionsController.defineMethod("init", function init() {

  ICA.getThemes()
    .then(function (themes) {
      this.suggestions = themes;
      this.updateView();
    }.bind(this));

});
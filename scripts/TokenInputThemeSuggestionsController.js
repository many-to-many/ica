
var TokenInputThemeSuggestionsController = TokenInputSuggestionsController.createComponent("TokenInputThemeSuggestionsController");

TokenInputThemeSuggestionsController.defineMethod("init", function init() {

  ICA.getThemes()
    .then(function (themes) {
      this.suggestions = themes;
      this.updateView();
    }.bind(this));

});
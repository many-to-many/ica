
// Controller extension

Controller.defineMethod("initView", function initView(updateView = []) {
  if (!this.view) return;
  this.view.controller = this;

  let element = this.view;

  // Init textarea
  element.querySelectorAll("textarea").forEach(function (element) {
    if (element._textareaInit) return;

    let style = window.getComputedStyle(element);
    let defaultRows = element.getAttribute("rows") || 1;

    element.rows = defaultRows;
    let paddingTop = parseInt(style.paddingTop);
    let paddingBottom = parseInt(style.paddingBottom);
    let lineHeight = parseInt(style.lineHeight);

    let resizeTextArea = function () {
      this.rows = defaultRows; // Reset to 1 for scroll height detection
      if (this.scrollHeight === 0) return;

      let rows = Math.round((this.scrollHeight - paddingTop - paddingBottom) / lineHeight);
      let maxRows = getElementProperty(this, "data-ica-max-rows");
      if (maxRows) this.rows = Math.min(rows, maxRows);
      else this.rows = rows;
    }.bind(element);

    element.addEventListener("click", resizeTextArea);
    element.addEventListener("focus", resizeTextArea);
    element.addEventListener("input", resizeTextArea);
    element.addEventListener("blur", resizeTextArea);
    resizeTextArea();

    element._textareaInit = true;
  });

  // Init input tokens
  element.querySelectorAll("[data-ica-format='tokens']").forEach(function (element) {
    if (element._formatInit) return;

    let tokenInputHandler = new TokenInputHandler(element);

    let tokenInputFragment = TokenInputController.createViewFragment();
    let tokenInputElement = tokenInputFragment.querySelector(".tokens");
    element.parentNode.insertBefore(tokenInputFragment, element);
    let tokenInputController = new TokenInputController(tokenInputHandler, tokenInputElement);
    if (element.controller) tokenInputController.componentOf = element.controller;

    switch (getElementProperty(element, "suggestions")) {
      case "themes": {
        let tokenSuggestionsFragment = TokenInputSuggestionsController.createViewFragment();
        let tokenSuggestionsElement = tokenSuggestionsFragment.querySelector(".tokens");
        element.parentNode.insertBefore(tokenSuggestionsFragment, element.nextSibling);
        let tokenSuggestionsController = new TokenInputThemeSuggestionsController(tokenInputHandler, tokenSuggestionsElement);
        if (element.controller) tokenSuggestionsController.componentOf = element.controller;
        break;
      }
    }

    element._formatInit = true;
  });

  // Use Plyr for audio/video
  plyr.setup(element.querySelectorAll(".player:not(.plyr--setup)"), {
    controls: ["play", "progress", "current-time", "fullscreen"]
  });

  resize(this.view);

  setElementProperty(this.view, "controller-id", this.controllerId);
  if (updateView) this.updateView.apply(this, updateView);
});

Controller.defineMethod("hideView", function hideView() {
  if (!this.view) return;
  this.view.hidden = true;
});

Controller.defineMethod("unhideView", function hideView() {
  if (!this.view) return;
  this.view.hidden = false;
});

Controller.defineMethod("uninitView", function () {
  this.unlockBodyScrolling();
});

(function (Controller) {

  let numBodyScrollLocks = 0;

  Controller.defineMethod("lockBodyScrolling", function lockBodyScrolling() {
    if (!this.lockingBodyScroll) {
      this.lockingBodyScroll = true;
      ++numBodyScrollLocks;

      document.body.style.overflow = "hidden";
    }
  });

  Controller.defineMethod("unlockBodyScrolling", function unlockBodyScrolling() {
    if (this.lockingBodyScroll) {
      this.lockingBodyScroll = false;

      if (--numBodyScrollLocks === 0) document.body.style.overflow = "";
    }
  });

}(Controller));



function resize(container = document.body) {
  container.querySelectorAll("[data-ica-width-multiple]")
    .forEach(function (element) {
      let multiple = parseInt(getElementProperty(element, "width-multiple"));
      element.style.width = Math.floor(document.body.offsetWidth / multiple) * multiple + "px";
    });
}

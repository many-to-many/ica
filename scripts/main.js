
var AppController = Controller.createComponent("AppController");

AppController.defineMethod("initView", function () {
  if (!this.view) return;

  this.explore = new Explore();

  ICA.getJointSources()
    .then(function (jointSources) {
      this.explore.addItems(jointSources);
      new ExploreController(
        this.explore,
        this.view.querySelector(".explore")
      ).componentOf = this;
    }.bind(this));
});

var appController;

/*****/

window.addEventListener("load", function () {
  window.addEventListener("resize", resize);
  init(document.body);

  appController = new AppController(document.body);

  document.querySelector("[href='#explore']").click();
});

/*****/

function switchAppView(view) {
  document.querySelectorAll("[data-ica-app-view]:not([data-ica-app-view='{0}'])".format(view)).forEach(function (element) {
    element.style.display = "none";
  });
  document.querySelectorAll("[data-ica-app-view='{0}']".format(view)).forEach(function (element) {
    element.style.display = "";
  });
}

function init(element) {
  // Init textarea
  element.querySelectorAll("textarea").forEach(function (element) {
    if (element._textareaInit) return;

    var style = window.getComputedStyle(element);
    var defaultRows = element.getAttribute("rows") || 1;

    element.rows = defaultRows;
    var paddingTop = parseInt(style.paddingTop);
    var paddingBottom = parseInt(style.paddingBottom);
    var lineHeight = parseInt(style.lineHeight);

    var resizeTextArea = function () {
      this.rows = defaultRows; // reset to 1 for scroll height detection
      if (this.scrollHeight == 0) return;

      var rows = Math.round((this.scrollHeight - paddingTop - paddingBottom) / lineHeight);
      var maxRows = getElementProperty(this, "data-ica-max-rows");
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
  element.querySelectorAll("input[type='file']").forEach(function (element) {
    if (element._fileInputInit) return;

    new FileInputHandler(element);

    element._fileInputInit = true;
  });

  // Init input tokens
  element.querySelectorAll("input[data-ica-format='tokens'], textarea[data-ica-format='tokens']").forEach(function (element) {
    if (element._formatInit) return;

    var tokenInputFragment = TokenInputController.createViewFragment();
    var tokenInputElement = tokenInputFragment.querySelector(".tokens");
    element.parentNode.insertBefore(tokenInputFragment, element);
    var tokenInputController = new TokenInputController(new TokenInputHandler(element), tokenInputElement);
    if (element.controller) tokenInputController.componentOf = element.controller;

    element._formatInit = true;
  });

  var anchorHistory = [];

  element.querySelectorAll("[data-ica-anchor-group]").forEach(function (element) {
    if (element._anchorGroupInit) return;

    element.addEventListener("click", function () {
      anchorHistory.push(this);
      while (anchorHistory.length > 50) anchorHistory.shift();

      switch (this.getAttribute("href")) {
      case "#explore":

        switchAppView("explore");

        break;
      case "#search":

        switchAppView("search");

        break;
      case "#publisher":

        anchorHistory.pop(); // Escape current anchor

        var publisherFragment = PublisherJointSourceController.createViewFragment();
        var publisherElement = publisherFragment.querySelector(".publisher");
        document.body.appendChild(publisherFragment);
        new PublisherJointSourceController(new JointSource(), publisherElement);

        return; // Does not focus on publisher
      case "#account":

        // Redirect to login if account id not available
        if (!ICA.accountId) {
          var continueAnchor = anchorHistory.pop(); // Escape current anchor

          ICA.login()
            .then(function () {
              console.log("Logged in");
              continueAnchor.click();
            })
            .catch(function (e) {
              console.warn(e);
            });

          return; // Await to continue
        }
        switchAppView("account");

        break;
      }

      document.body.querySelectorAll("[data-ica-anchor-group='" + getElementProperty(this, "anchor-group") + "']")
        .forEach(function (element) {
          element.classList.remove("active");
        });
      this.classList.add("active");
    }.bind(element));

    element._anchorGroupInit = true;
  });

  resize();
}

function resize() {
  document.body.querySelectorAll("[data-ica-width-multiple]")
    .forEach(function (element) {
      var multiple = parseInt(getElementProperty(element, "width-multiple"));
      element.style.width = Math.floor(document.body.offsetWidth / multiple) * multiple + "px";
    });
}
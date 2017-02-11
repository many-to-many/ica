
function $(selector, element) {
  element = element || document;
  var nodeList = element.querySelectorAll(selector);
  nodeList.each = function (func) {
    nodeList.forEach(function (node) {
      func.bind(node)();
    });
  };
  return nodeList;
}

function switchAppView(view) {
  $("[data-ica-app-view]:not([data-ica-app-view='{0}'])".format(view)).forEach(function (element) {
    element.style.display = "none";
  });
  $("[data-ica-app-view='{0}']".format(view)).forEach(function (element) {
    element.style.display = "";
  });
}

function init(element) {

  // Init textarea
  $("form textarea", element).each(function () {
    if (this._textareaInit) return;

    var style = window.getComputedStyle(this);
    var defaultRows = this.getAttribute("rows") || 1;

    this.rows = defaultRows;
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
    }.bind(this);

    this.addEventListener("click", resizeTextArea);
    this.addEventListener("focus", resizeTextArea);
    this.addEventListener("input", resizeTextArea);
    this.addEventListener("blur", resizeTextArea);
    resizeTextArea();

    this._textareaInit = true;
  });

  // Init input tokens
  $("input[type='file']", element).each(function () {
    if (this._fileInputInit) return;

    var fileInputHandler = new FileInputHandler(this);

    this._fileInputInit = true;
  });

  // Init input tokens
  $("input[data-ica-format='tokens'], textarea[data-ica-format='tokens']", element).each(function () {
    if (this._formatInit) return;

    var tokenInputFragment = TokenInputController.createViewFragment();
    var tokenInputElement = tokenInputFragment.querySelector(".tokens");
    this.parentNode.insertBefore(tokenInputFragment, this);
    var tokenInputController = new TokenInputController(new TokenInputHandler(this), tokenInputElement);
    if (element.controller) tokenInputController.componentOf = element.controller;

    this._formatInit = true;
  });

  var anchorHistory = [];

  $("[data-ica-anchor-group]", element).each(function () {
    if (this._anchorGroupInit) return;

    this.addEventListener("click", function () {
      anchorHistory.push(this);
      while (anchorHistory.length > 50) anchorHistory.shift();

      switch (this.getAttribute("href")) {

        case "#explore":

          switchAppView("explore");

          break;

        case "#publisher":

          anchorHistory.pop(); // Escape current anchor

          var publisherFragment = PublisherJointSourceController.createViewFragment();
          var publisherElement = publisherFragment.querySelector(".publisher");
          document.body.appendChild(publisherFragment);
          var publisherController = new PublisherJointSourceController(new JointSource(), publisherElement);

          return; // Does not focus on publisher

          break;

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

      $("[data-ica-anchor-group='" + getElementProperty(this, "anchor-group") + "']", element).each(function () {
        this.classList.remove("active");
      });
      this.classList.add("active");
    }.bind(this));

    this._anchorGroupInit = true;
  });

  resize();

}

function resize() {

  $("[data-ica-width-multiple]").each(function () {

    var multiple = parseInt(getElementProperty(this, "width-multiple"));
    this.style.width = Math.floor(document.body.offsetWidth / multiple) * multiple + "px";

  });

}

/***/

var explore = new Explore();

window.addEventListener("load", function () {
  window.addEventListener("resize", resize);
  init();

  ICA.getJointSources()
    .then(function (jointSources) {
      explore.addItems(jointSources);
      var exploreElement = document.querySelector(".explore");
      var exploreController = new ExploreController(explore, exploreElement);
    });

  $("[href='#explore']")[0].click();
  $("[href='#publisher']")[0].click();
  // $("[data-ica-action='add-source/text']")[0].click();

});

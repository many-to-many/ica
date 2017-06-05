
var AppController = Controller.createComponent("AppController");

AppController.defineMethod("initView", function () {
  if (!this.view) return;

  this.explore = new Explore();
  new ExploreController(
    this.explore,
    this.view.querySelector(".explore")
  ).componentOf = this;

  ICA.getConversations()
    .then(function (conversations) {
      this.explore.requestNextConversations = conversations.requestNext;
      this.explore.addItems(conversations);
      this.explore.didUpdate();
    }.bind(this), function (err) {
      console.error(err.message);
    });

  this.searchExplore = new Explore();
  new ExploreController(
    this.searchExplore,
    this.view.querySelector(".search .explore")
  ).componentOf = this;

  this.view.querySelectorAll(".search .search-control [data-ica-conversation-query-meta]").forEach(function (element) {
    element.addEventListener("input", function (evt) {
      ICA.getConversations({
        q: this.querySelector(".search .search-control [data-ica-conversation-query-meta='title']").value
      })
         .then(function (conversations) {
           this.controller.searchExplore.requestNextConversations = conversations.requestNext;
           this.controller.searchExplore.putItems(conversations);
           this.controller.searchExplore.didUpdate();
         }.bind(this), function (err) {
           console.error(err.toString());
         });
    }.bind(this));
  }.bind(this.view));

  new Routine(function () {
    this.view.querySelectorAll("[data-ica-app-view]").forEach(function (view) {
      if (view.style.display != "none") {
        var element = view.querySelector(".explore");
        if (!element) return;
        var rect = element.getBoundingClientRect();
        var explore = element.controller.model;
        if (rect.bottom < 2 * document.body.offsetHeight
          && explore.requestNextConversations) {
          // Need to load more content
          console.count("Need to load more");
          let requestNext = explore.requestNextConversations;
          explore.requestNextConversations = undefined;
          requestNext()
            .then(function (conversations) {
              var explore = this.controller.model;
              explore.requestNextConversations = conversations.requestNext;
              explore.addItems(conversations);
              explore.didUpdate();
            }.bind(element), function (err) {
              if (err instanceof ICA.APIResponse.EndOfResponse) {
                // End of response
                console.log("Explore: End of response");
              } else {
                // Critical error
                console.error(err.message);
              }
            });
        }
      }
    });
  }.bind(this), 500, true)
    .componentOf = this;
});

/*****/

window.addEventListener("load", function () {
  window.addEventListener("resize", resize);

  notifications = new Notifications();
  new NotificationsController(notifications, document.body);
  appController = new AppController(document.body);

  document.querySelector("[href='#main']").click();
});

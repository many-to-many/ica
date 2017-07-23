
let AppController = Controller.createComponent("AppController");

AppController.defineMethod("initView", function () {
  if (!this.view) return;

  // Views

  this.view.querySelectorAll("[data-ica-for-view]").forEach(function (element) {
    element.addEventListener("click", function (event) {
      event.preventDefault();

      switch (getElementProperty(this, "for-view")) {
        case "conversations": appConversationsController.focusView(); break;
        case "discussions": appDiscussionsController.focusView(); break;
        case "search": appSearchController.focusView(); break;
        case "publisher":

          {
            let publisherFragment = PublisherConversationController.createViewFragment();
            let publisherElement = publisherFragment.querySelector(".publisher-container");
            document.body.querySelector(".app-view").appendChild(publisherFragment);
            new PublisherConversationController(new Conversation(), publisherElement);
          }

          break;
        case "account":

          // Redirect to login if account id not available
          if (!ICA.accountId) {
            // Await to continue
            ICA.login()
              .then(function () {
                appAccountController.focusView();
            }, console.warn);
          } else {
            appAccountController.focusView();
          }

          break;
        case "about": appAboutController.focusView(); break;
        default:
          console.warn("Unknown anchor", this.getAttribute("href"));
      }
    });
  });
});

let AppViewController = Controller.createComponent("AppViewController");

AppViewController.defineMethod("unhideView", function unhideView() {
  if (!this.view) return;

  let view = getElementProperty(this.view, "view");

  for (let element of this.view.parentNode.querySelectorAll("[data-ica-view]")) {
    element.hidden = element !== this.view;
  }

  for (let element of document.body.querySelectorAll("[data-ica-for-view]")) {
    let forView = getElementProperty(element, "for-view");
    element.classList.toggle("active", view === forView);
  }
});

AppViewController.prototype.destroy = function () {}; // Block destory method

let AppJointSourcesController = AppViewController.createComponent("AppJointSourcesController");

AppJointSourcesController.defineMethod("initView", function () {
  if (!this.view) return;

  // Explore

  this.explore = new Explore();
  new ExploreController(
    this.explore,
    this.view.querySelector(".explore")
  ).componentOf = this;

  // Pagination

  new Routine(function () {
    if (!this.view.hidden) {
      let element = this.view.querySelector(".explore");
      if (!element) return;

      let rect = element.getBoundingClientRect();
      let explore = element.controller.explore;

      if (rect.bottom < 2 * document.body.offsetHeight
        && explore.requestNext) {
        // Need to load more content

        console.count("Need to load more");
        let requestNext = explore.requestNext;
        explore.requestNext = undefined;

        requestNext()
          .then(function (conversations) {
            explore.requestNext = conversations.requestNext;
            explore.addItems(conversations);
            explore.didUpdate();
          }.bind(element), function (err) {
            if (err instanceof ICA.APIResponse.EndOfResponse) {
              // End of response
              console.log("AppJointSourcesController: End of response");
            } else {
              // Critical error
              console.error(err.message);
            }
          });

        element.classList.toggle("loading", true);
      } else {
        element.classList.toggle("loading", false);
      }
    }
  }.bind(this), 500, true)
    .componentOf = this;

});

let AppConversationsController = AppJointSourcesController.createComponent("AppConversationsController");

AppConversationsController.defineMethod("focusView", function () {
  Router.push(this, "/conversations", "Conversations | Many-to-Many");

  if (this.explore.items.length === 0) {
    ICA.getConversations()
      .then(function (conversations) {
        this.explore.requestNext = conversations.requestNext;
        this.explore.addItems(conversations);
        this.explore.didUpdate();
      }.bind(this), function (err) {
        console.error(err.message);
      });
  }
});

let AppDiscussionsController = AppJointSourcesController.createComponent("AppDiscussionsController");

AppDiscussionsController.defineMethod("focusView", function () {
  Router.push(this, "/discussions", "Discussions | Many-to-Many");

  if (this.explore.items.length === 0) {
    ICA.getDiscussions()
      .then(function (discussions) {
        this.explore.requestNext = discussions.requestNext;
        this.explore.addItems(discussions);
        this.explore.didUpdate();
      }.bind(this), function (err) {
        console.error(err.message);
      });
  }
});

let AppMainSearchController = AppJointSourcesController.createComponent("AppMainSearchController");

AppMainSearchController.defineMethod("initView", function () {
  if (!this.view) return;

  this.view.querySelectorAll(".search-control [data-ica-conversation-query-meta]").forEach(function (element) {
    element.addEventListener("input", function () {
      ICA.getConversations({
        q: this.querySelector(".search-control [data-ica-conversation-query-meta='title']").value
      })
        .then(function (conversations) {
          this.controller.explore.requestNext = conversations.requestNext;
          this.controller.explore.putItems(conversations);
          this.controller.explore.didUpdate();
        }.bind(this), function (err) {
          console.error(err.message);
        });
    }.bind(this));
  }.bind(this.view));
});

AppMainSearchController.defineMethod("focusView", function () {
  Router.push(this, "/search", "Search | Many-to-Many");
});

let AppAccountController = AppViewController.createComponent("AppAccountController");

AppAccountController.defineMethod("focusView", function () {
  Router.push(this, "/account", "Many-to-Many");
});

let AppAboutController = AppViewController.createComponent("AppAboutController");

AppAboutController.defineMethod("focusView", function () {
  Router.push(this, "/about", "About | Many-to-Many");
});

// Load

window.addEventListener("load", function () {
  window.addEventListener("resize", function () {
    resize();
  });

  notifications = new Notifications();
  new NotificationsController(notifications, document.body);
  appController = new AppController(document.body);

  appConversationsController = new AppConversationsController(document.querySelector(".conversations"));
  appDiscussionsController = new AppDiscussionsController(document.querySelector(".discussions"));
  appSearchController = new AppMainSearchController(document.querySelector(".search"));
  appAccountController = new AppAccountController(document.querySelector(".account"));
  appAboutController = new AppAboutController(document.querySelector(".about-container"));

  for (_ of [
    {
      pattern: /\/conversations\/?$/,
      func: function () {
        appConversationsController.focusView();
      }
    },
    {
      pattern: /\/conversations\/(\d+)\/?$/,
      func: function (matches) {
        let conversationId = matches[1];

        ICA.getConversation(conversationId)
          .then(function (conversation) {
            let fragment = MapArticleConversationController.createViewFragment();
            let element = fragment.querySelector(".article-container");
            document.body.querySelector(".app-view").appendChild(fragment);
            new MapArticleConversationController(conversation, element);
          }, function () {
            appConversationsController.focusView();
          });
      }
    },
    {
      pattern: /\/conversations\/new\/?$/,
      func: function () {
        let publisherFragment = PublisherConversationController.createViewFragment();
        let publisherElement = publisherFragment.querySelector(".publisher-container");
        document.body.querySelector(".app-view").appendChild(publisherFragment);
        new PublisherConversationController(new Conversation(), publisherElement);
      }
    },
    {
      pattern: /\/conversations\/(\d+)\/edit\/?$/,
      func: function (matches) {
        let conversationId = matches[1];

        ICA.getConversation(conversationId)
          .then(function (conversation) {
            let publisherFragment = PublisherConversationController.createViewFragment();
            let publisherElement = publisherFragment.querySelector(".publisher-container");
            document.body.querySelector(".app-view").appendChild(publisherFragment);
            new PublisherConversationController(conversation, publisherElement);
          }, function () {
            appConversationsController.focusView();
          });
      }
    },
    {
      pattern: /\/discussions\/?$/,
      func: function () {
        appDiscussionsController.focusView();
      }
    },
    {
      pattern: /\/discussions\/(\d+)\/?$/,
      func: function (matches) {
        let discussionId = matches[1];

        ICA.getDiscussion(discussionId)
          .then(function (discussion) {
            let fragment = MapArticleDiscussionController.createViewFragment();
            let element = fragment.querySelector(".article-container");
            document.body.querySelector(".app-view").appendChild(fragment);
            new MapArticleDiscussionController(discussion, element);
          }, function () {
            appDiscussionsController.focusView();
          });
      }
    },
    {
      pattern: /\/search\/?$/,
      func: function () {
        appSearchController.focusView();
      }
    },
    {
      pattern: /\/account\/?$/,
      func: function () {

        // Redirect to login if account id not available
        if (!ICA.accountId) {
          // Do not popup for user login
          appConversationsController.focusView();
        } else {
          appAccountController.focusView();
        }

      }
    },
    {
      pattern: /\/about\/?$/,
      func: function () {
        appAboutController.focusView();
      }
    },
    {
      pattern: /.*/,
      func: function () {
        appConversationsController.focusView();
      }
    }
  ]) {
    let matches = window.location.href.match(_.pattern);
    if (matches) {
      _.func(matches);
      break;
    }
  }
});

// Router

const Router = (function () {
  let page = new Date().getTime();

  window.addEventListener("popstate", function (event) {
    if (event.state) {
      if (event.state.page !== page) {
        // From a different page
        window.location.reload();
      } else if (event.state.index + 1 > back.length) {
        // Go forward
        while (back.length < event.state.index + 1 && forward.length > 0) goForward();
      } else {
        // Go back
        while (back.length > event.state.index + 1 && back.length > 1) goBack();
      }
    } else {
      // Back to landing
      while (back.length > 1) goBack();
    }
  });

  let back = [], forward = [];

  function goBack() {
    if (back.length > 1) {
      let _ = back.pop();
      forward.push(_);
      _.controller.hideView();
    }

    back[back.length - 1].controller.unhideView();
  }

  function goForward() {
    back[back.length - 1].controller.hideView();

    if (forward.length > 0) {
      let _ = forward.pop();
      back.push(_);
      _.controller.unhideView();
    }
  }

  let tempController, tempUrl, tempTitle;

  function prepush(controller, url, title) {
    tempController = controller;
    tempUrl = url;
    tempTitle = title;
  }

  function push(controller, url, title) {
    // Clear forward entries
    while (forward.length > 0) {
      let _ = forward.pop();
      _.controller.destroy(true);
    }

    // Insert into history
    back.push({
      controller: tempController || controller,
      url: tempUrl || url,
      title: tempTitle || title
    });

    if (back.length > 1) {
      window.history.pushState({
        index: Router.index,
        page: page
      }, title, url);

      back[back.length - 2].controller.hideView();
    } else {
      window.history.replaceState({
        index: Router.index,
        page: page
      }, title, url);
    }

    back[back.length - 1].controller.unhideView();

    tempController = undefined;
    tempUrl = undefined;
    tempTitle = undefined;
  }

  function jump(index) {
    if (index < 0) return; // Index out of bound

    let cmp = index + 1 - back.length;
    if (cmp < 0) {
      window.history.go(cmp);
      while (back.length > index + 1) goBack();
    } else if (cmp > 0) {
      throw new Error("Jumping forward not supported yet");
    }
  }

  let Router = {
    prepush: prepush,
    push: push,
    jump: jump
  };

  Object.defineProperty(Router, "index", {
    get: function () {
      return back.length - 1;
    }
  });

  return Router;
})();

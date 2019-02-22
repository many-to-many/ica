
/**
 * AppController
 */
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
        case "publisher-discussion":

          {
            let publisherFragment = PublisherDiscussionController.createViewFragment();
            let publisherElement = publisherFragment.querySelector(".publisher-container");
            document.body.querySelector(".app-view").appendChild(publisherFragment);
            new PublisherDiscussionController(new Discussion(), publisherElement);
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

/**
 * AppViewMixin
 */
function AppViewMixin(Controller) {

  Controller.defineMethod("unhideView", function unhideView() {
    if (!this.view) return;

    for (let element of document.body.querySelectorAll("[data-ica-view]")) {
      element.hidden = element !== this.view;
    }

    let view = getElementProperty(this.view, "view");
    for (let element of document.body.querySelectorAll("[data-ica-for-view]")) {
      element.classList.toggle("active", getElementProperty(element, "for-view") === view);
    }
  });

  return Controller;

}

/**
 * AppViewController
 */
let AppViewController = AppViewMixin(Controller.createComponent("AppViewController"));

AppViewController.prototype.destroy = function () {}; // Block destory method

/**
 * AppJointSourcesController
 */
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
          }.bind(element), function (e) {
            if (e instanceof ICA.APIResponse.EndOfResponse) {
              // End of response
              console.log("AppJointSourcesController: End of response");
            } else {
              // Critical error
              console.error(e.message);
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

/**
 * AppConversationsController
 */
let AppConversationsController = AppJointSourcesController.createComponent("AppConversationsController");

AppConversationsController.defineMethod("focusView", function () {
  Router.push(this, "/conversations", "Conversations | Many-to-Many");

  if (this.explore.items.length === 0) {
    ICA.getConversations()
      .then(function (conversations) {
        this.explore.requestNext = conversations.requestNext;
        this.explore.addItems(conversations);
        this.explore.didUpdate();
      }.bind(this), function (e) {
        console.error(e.message);
      });
  }
});

/**
 * AppDiscussionsController
 */
let AppDiscussionsController = AppJointSourcesController.createComponent("AppDiscussionsController");

AppDiscussionsController.defineMethod("focusView", function () {
  Router.push(this, "/discussions", "Discussions | Many-to-Many");

  if (this.explore.items.length === 0) {
    ICA.getDiscussions()
      .then(function (discussions) {
        this.explore.requestNext = discussions.requestNext;
        this.explore.addItems(discussions);
        this.explore.didUpdate();
      }.bind(this), function (e) {
        console.error(e.message);
      });
  }
});

/**
 * AppMainSearchController
 */
let AppMainSearchController = AppJointSourcesController.createComponent("AppMainSearchController");

AppMainSearchController.defineMethod("initView", function () {
  if (!this.view) return;

  this.view.querySelectorAll(".search-control [data-ica-conversation-query-meta]").forEach(function (element) {
    element.addEventListener("input", function () {
      const q = this.querySelector(".search-control [data-ica-conversation-query-meta='title']").value;

      Router.replace(q ? `/search?q=${q}` : "/search");

      ICA.getJointSources({ q })
        .then(function (jointSources) {
          this.controller.explore.requestNext = jointSources.requestNext;
          this.controller.explore.putItems(jointSources);
          this.controller.explore.didUpdate();
        }.bind(this), function (e) {
          console.error(e.message);
        });
    }.bind(this));
  }.bind(this.view));
});

AppMainSearchController.defineMethod("focusView", function () {
  Router.push(this, "/search", "Search | Many-to-Many");
});

/**
 * AppAccountController
 */
let AppAccountController = AppViewController.createComponent("AppAccountController");

AppAccountController.defineMethod("focusView", function () {
  Router.push(this, "/account", "Many-to-Many");
});

/**
 * AppAboutController
 */
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
      pattern: /\/jointsources\/(\d+)\/?$/,
      func: function (matches) {
        let jointSourceId = matches[1];

        ICA.getJointSource(jointSourceId)
          .then(function (jointSource) {
            let Controller;
            switch (jointSource.constructor) {
              case Conversation:
                Controller = MapArticleConversationController;
                break;
              case Discussion:
                Controller = MapArticleDiscussionController;
                break;
              default:
                throw new Error("Joint source type not supported");
            }

            let fragment = Controller.createViewFragment();
            let element = fragment.querySelector(".article-container");
            document.body.querySelector(".app-view").appendChild(fragment);
            new Controller(discussion, element);
          })
          .catch(function (e) {
            console.warn(e);

            appConversationsController.focusView();
          });
      }
    },
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
          }, function (e) {
            console.warn(e);

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
          }, function (e) {
            console.warn(e);

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
          }, function (e) {
            console.warn(e);

            appDiscussionsController.focusView();
          });
      }
    },
    {
      pattern: /\/discussions\/new\/?$/,
      func: function () {
        let publisherFragment = PublisherDiscussionController.createViewFragment();
        let publisherElement = publisherFragment.querySelector(".publisher-container");
        document.body.querySelector(".app-view").appendChild(publisherFragment);
        new PublisherDiscussionController(new Discussion(), publisherElement);
      }
    },
    {
      pattern: /\/discussions\/(\d+)\/edit\/?$/,
      func: function (matches) {
        let discussionId = matches[1];

        ICA.getDiscussion(discussionId)
          .then(function (discussion) {
            let publisherFragment = PublisherDiscussionController.createViewFragment();
            let publisherElement = publisherFragment.querySelector(".publisher-container");
            document.body.querySelector(".app-view").appendChild(publisherFragment);
            new PublisherDiscussionController(discussion, publisherElement);
          }, function (e) {
            console.warn(e);

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

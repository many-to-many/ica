
/**
 * PublisherDiscussionController
 * Concrete view controller to present a meta-conversation.
 * @constructor
 */
let PublisherDiscussionController = DiscussionController.createComponent("PublisherDiscussionController");

PublisherDiscussionController.createViewFragment = function () {
  return cloneTemplate("#template-publisher-discussion");
};

PublisherDiscussionController.defineMethod("initModel", function initModel() {
  if (!this.model) return;

  this.jointSource.backup();
});

PublisherDiscussionController.defineMethod("uninitModel", function uninitModel() {
  if (!this.model) return;

  if (this.discussion.discussionId < 0) {
    let discussion = this.discussion;

    this.releaseModel(discussion); // Temporary release model to avoid recursive calls on this method
    discussion.destroy(true, true, true);
    this.retainModel(discussion);
  } else {
    this.jointSource.recover();
    this.jointSource.didUpdate();
  }
});

// View

PublisherDiscussionController.defineMethod("initView", function initView() {
  if (!this.view) return;

  let routerIndex = Router.index;

  this.view.querySelectorAll("[data-ica-jointsource-meta]").forEach(function (element) {
    let key = element.dataset.icaJointsourceMeta;

    // Event listeners
    element.addEventListener("change", function () {
      // User input change
      this.controller.discussion[key]["0"] = getFormattedInputValue(element);
      this.controller.discussion.didUpdate();
    }.bind(this.view));
    element.addEventListener("ica-change", function () {
      // Simulated input change
      this.controller.discussion[key]["0"] = getFormattedInputValue(element);
      this.controller.discussion.didUpdate();
    }.bind(this.view));

    // Init input values
    setInputValue(element, this.discussion[key]["0"]);
  }.bind(this));

  this.view.querySelector("[data-ica-action='abort']").addEventListener("click", function (event) {
    event.preventDefault();

    if (routerIndex > 0) {
      // Jump to the previous page
      Router.jump(routerIndex);
    } else {
      // Default to meta-conversation listing
      appDiscussionsController.focusView();
    }
  }.bind(this.view));

  this.view.querySelector("[data-ica-action='unpublish']").addEventListener("click", function (event) {
    event.preventDefault();

    this.controller.unpublish();
  }.bind(this.view));

  this.view.querySelector("[data-ica-action='publish']").addEventListener("click", function (event) {
    event.preventDefault();

    this.controller.publish();
  }.bind(this.view));

  if (this.discussion.discussionId < 0) {
    Router.push(this, "/discussions/new", "Open a Meta-Conversation | Many-to-Many");
  } else {
    Router.push(this, "/discussions/{0}/edit".format(this.discussion.discussionId), "Meta-Conversation | Many-to-Many");
  }
});

PublisherDiscussionController.defineMethod("updateView", function updateView() {
  if (!this.view) return;

  // Display danger zone
  this.view.querySelector("[data-ica-jointsource-filter='published']").hidden = this.discussion.discussionId < 0;
});

PublisherDiscussionController.defineMethod("unhideView", function unhideView() {
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


PublisherDiscussionController.prototype.publish = function () {
  return this.discussion.publish("Publishing meta-conversation...")
    .then(function (discussion) {
      Router.replace("/discussions/{0}/edit".format(discussion.discussionId), "Meta-Conversation | Many-to-Many");
      appDiscussionsController.focusView();

      // The discussion is intentionally added to the explore after focusing so the controller populates its content
      if (discussion) {
        appDiscussionsController.explore.addItems([discussion]);
        appDiscussionsController.explore.didUpdate();
      }

      // Display notification
      notifications.addNotification(new BasicNotification("Meta-Conversation published!"));
      notifications.didUpdate();

    })
    .catch(function (e) {
      console.warn(e);

      // Display notification
      notifications.addNotification(new BasicNotification("Failed to publish meta-conversation", e ? e.message : undefined));
      notifications.didUpdate();
    });
};

PublisherDiscussionController.prototype.unpublish = function () {
  return new Promise(function (resolve, reject) {
    let prompt = new BasicPrompt(
      "Unpublishing \"{0}\"...".format(this.discussion.meta.title),
      "Are you sure you would like to continue?",
      [
        new PromptAction(
          "Abort",
          function () {
            reject(new Error("Process aborted"));
          }
        ),
        new PromptAction(
          "Continue",
          function () {
            resolve();
          },
          true
        )
      ]
    );
    let fragment = BasicPromptController.createViewFragment();
    let element = fragment.querySelector(".prompt");
    document.body.appendChild(fragment);
    new BasicPromptController(prompt, element);
  }.bind(this))
    .then(function () {
      return this.discussion.unpublish("Unpublishing meta-conversation...");
    }.bind(this))
    .then(function () {
      // Display notification
      notifications.addNotification(new BasicNotification("Meta-Conversation unpublished"));
      notifications.didUpdate();

      this.discussion.destroy(true, true, true);
      appDiscussionsController.focusView();
    }.bind(this))
    .catch(function (e) {
      console.warn(e);

      // Display notification
      notifications.addNotification(new BasicNotification("Failed to unpublish meta-conversation", e ? e.message : undefined));
      notifications.didUpdate();
    });
};

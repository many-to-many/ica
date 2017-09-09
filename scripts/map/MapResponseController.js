
/**
 * MapResponseController
 * Concrete view controller to display a Response.
 * @constructor
 */
let MapResponseController = ResponseController.createComponent("MapResponseController");

MapResponseController.createViewFragment = function () {
  return cloneTemplate("#template-map-response");
};

// Model

MapResponseController.defineMethod("initModel", function initModel() {
  if (!this.model) return;

  this.response.backup();

});

MapResponseController.defineMethod("uninitModel", function uninitModel() {
  if (!this.model) return;

  if (this.lockingJointSource) {
    this.response.recover();
    this.unlockJointSource();
    this.response.didUpdate();
  }

});

// View

(function (MapResponseController) {

  MapResponseController.defineMethod("initView", function initView() {
    if (!this.view) return;

    if (this.response.responseId < 0) {
      this.lockJointSource();
    }

    this.view.addEventListener("click", viewOnClick);

    // Message editor

    this.mentionedJointSources = {};
    this.pinnedRefereeJointSources = {};
    this.pinnedHiddenRefereeJointSources = {};

    this.quill = new Quill(this.view.querySelector(".response-message"), {
      modules: {
        linkify: {
          onchange: function (links, source) {

            let mentionedJointSourcePromises = [];

            for (let link of links) {
              let {category, jointSourceId} = LinkBlot.describeLink(link);

              if (jointSourceId) {
                let promise;

                switch (category) {
                  case "jointsources":
                    promise = ICA.getJointSource(jointSourceId);
                    break;
                  case "conversations":
                    promise = ICA.getConversation(jointSourceId);
                    break;
                  case "discussions":
                    promise = ICA.getDiscussion(jointSourceId);
                    break;
                  default: continue;
                }

                promise = promise
                  .then(function (jointSource) {
                    switch (jointSource.constructor) {
                      case Conversation:
                      case Discussion:
                        // Only allow conversations and discussions for now
                        return jointSource;
                    }
                  })
                  .catch(function () {
                    // Do not emit error when joint source not found
                  });

                mentionedJointSourcePromises.push(promise);
              }
            }

            Promise.all(mentionedJointSourcePromises)
              .then(function (mentionedJointSources) {

                this.mentionedJointSources = {};

                if (source === "api") {

                  this.pinnedRefereeJointSources = {};
                  this.pinnedHiddenRefereeJointSources = {};

                  Object.keys(this.response._backup_referees).forEach(function (jointSourceId) {
                    this.pinnedRefereeJointSources[jointSourceId] = true;
                  }.bind(this));

                  mentionedJointSources.forEach(function (jointSource) {
                    if (!jointSource) return;

                    if (!this.response._backup_referees[jointSource.jointSourceId]) {
                      this.pinnedHiddenRefereeJointSources[jointSource.jointSourceId] = jointSource;
                    }

                    this.mentionedJointSources[jointSource.jointSourceId] = jointSource;
                  }.bind(this));

                } else {

                  mentionedJointSources.forEach(function (jointSource) {
                    if (!jointSource) return;

                    this.mentionedJointSources[jointSource.jointSourceId] = jointSource;
                  }.bind(this));

                  let refereeJointSourceIds = Object.keys(this.response.referees).sort();
                  this.updateResponseReferees();
                  let updatedRefereeJointSourceIds = Object.keys(this.response.referees).sort();

                  if (!updatedRefereeJointSourceIds.equals(refereeJointSourceIds)) {
                    this.response.didUpdate();
                  }

                }
              }.bind(this))
              .catch(function (e) {
                console.warn(e);
              });

          }.bind(this)
        }
      },
      placeholder: this.response.responseId < 0 ? "Post a new response here..." : "Edit the response here..."
    });

    // Simulate text change from API to prepare pinnedRefereeJointSources
    // Otherwise empty responses may be prevented from publishing due to missing referees/referrers
    this.quill.options.modules.linkify.onchange([], "api");

    this.quill.on("text-change", limitPulses(function (delta, oldDelta, source) {

      if (source === "user") {
        this.response.message["0"] = this.quill.getText().replace(/\s*$/, ""); // Ignore spaces
        this.response.didUpdate();
      }

    }.bind(this), 30));

    // Edit/Publish

    let editResponseElement = this.view.querySelector("[data-ica-action='edit-response']");
    editResponseElement.addEventListener("click", editResponseOnClick);
    editResponseElement.controller = this;

    let publishResponseElement = this.view.querySelector("[data-ica-action='publish-response']");
    publishResponseElement.addEventListener("click", publishResponseOnClick);
    publishResponseElement.controller = this;

    let unpublishResponseElement = this.view.querySelector("[data-ica-action='unpublish-response']");
    unpublishResponseElement.addEventListener("click", unpublishResponseOnClick);
    unpublishResponseElement.controller = this;

    let discardEditResponseElement = this.view.querySelector("[data-ica-action='discard-edit-response']");
    discardEditResponseElement.addEventListener("click", discardEditResponse);
    discardEditResponseElement.controller = this;

    // Extra

    new ExploreRefereesController(this.response, this.view.querySelector(".response-referees")).componentOf = this;

    new ExploreHiddenRefereesController(this.response, this.view.querySelector(".response-referees-suggestions")).componentOf = this;

  });

  MapResponseController.defineMethod("updateView", function updateView() {
    if (!this.view) return;

    // TODO: Optimization needed for avoiding frequent author and status updates

    if (!this.lockingJointSource) {
      if (this.quill.getText().replace(/\s*$/, "") !== this.response.message["0"] ? this.response.message["0"] : "") {
        this.quill.setText(this.response.message["0"] ? this.response.message["0"] : "");
      }
    }

    this.quill.enable(this.lockingJointSource);

    this.view.querySelector("[data-ica-action='edit-response']").hidden = !(!this.jointSource.locked && this.response._authorId && this.response._authorId === ICA.accountId);
    this.view.querySelector("[data-ica-action='publish-response']").hidden = !(this.lockingJointSource && this.response.message["0"] && this.response.message["0"] !== this.response._backup_message["0"]);
    this.view.querySelector("[data-ica-action='unpublish-response']").hidden = !(!this.lockingJointSource && this.response.responseId > 0 && this.response._authorId && this.response._authorId === ICA.accountId);
    this.view.querySelector("[data-ica-action='discard-edit-response']").hidden = !(this.lockingJointSource && this.response.responseId > 0);

    // Update time author
    this.view.querySelector("[data-ica-response-timestamp='authored']").textContent =
      this.response._timestampAuthored
        ? new Date(this.response._timestampAuthored * 1000).toLocaleString("en-us")
        : "Draft";

    // Show/hide author's identicon
    let identiconElement = this.view.querySelector(".response-author-identicon");
    identiconElement.hidden = !this.response._authorId;

    if (this.response._authorId) {
      // Update author's identicon
      jdenticon.update(identiconElement, "author-{0}".format(this.response._authorId), 0.05);

      this.response.getAuthor()
        .then(function (author) {
          if (!this.view) return;

          this.view.querySelector("[data-ica-response-author='name']").textContent = author.name || "Anonymous";
        }.bind(this));
    } else {
      this.view.querySelector("[data-ica-response-author]").textContent = "Author";
    }

    // Status

    let statusElement = this.view.querySelector(".response-status");

    if (this.response.responseId > 0) {

      // Check if the response is contained in a discussion
      this.response.getDiscussions()
        .then(function (discussions) {

          let numReferees = Object.keys(this.response.referees).length;
          let status = "";

          if (this.componentOf.jointSource !== this.response && this.response.responseId > 0)
            switch (this.componentOf.jointSource.constructor) {
              case Conversation:

                if (numReferees > 1 || discussions.length > 0) {
                  status = "mentioned this";

                  if (discussions.length === 1) {
                    if (discussions[0].constructor === Discussion) {
                      status += " in a discussion thread";
                    } else {
                      status += " at another place";
                    }
                  } else if (discussions.length > 1) {
                    status += " at other places";
                  } else {
                    status += " in a response";
                  }

                } else {
                  status = "responded to this";
                }

                break;
            }

          statusElement.textContent = status;

        }.bind(this));

    } else {

      statusElement.textContent = "";

    }

    // Referee dependent view components

    this.updateViewExtraVisibility();

  });

  MapResponseController.defineMethod("uninitView", function uninitView() {
    if (!this.view) return;

    // Edit/Publish

    this.view.querySelector("[data-ica-action='edit-response']").removeEventListener("click", editResponseOnClick);

    this.view.querySelector("[data-ica-action='publish-response']").removeEventListener("click", publishResponseOnClick);

    this.view.querySelector("[data-ica-action='unpublish-response']").removeEventListener("click", unpublishResponseOnClick);

    this.view.querySelector("[data-ica-action='discard-edit-response']").removeEventListener("click", discardEditResponse);

  });

  // Shared functions

  function viewOnClick(event) {
    event.stopPropagation();
  }

  function editResponseOnClick(event) {
    event.preventDefault();

    this.controller.lockJointSource();
    this.controller.response.didUpdate(); // Expensive way to propagate lock event

  }

  function publishResponseOnClick(event) {
    event.preventDefault();

    this.controller.publish()
      .then(function () {

        this.controller.unlockJointSource();
        this.controller.response.didUpdate(); // Expensive way to propagate lock event

      }.bind(this));

  }

  function unpublishResponseOnClick(event) {
    event.preventDefault();

    this.controller.unpublish();

  }

  function discardEditResponse(event) {
    event.preventDefault();

    this.controller.response.recover();
    this.controller.unlockJointSource();
    this.controller.response.didUpdate(); // Auto-trigger update view

  }

})(MapResponseController);

MapResponseController.prototype.updateViewExtraVisibility = function updateViewExtra() {
  if (!this.view) return;

  // Extra

  let showExtra = [

    function () {
      let element = this.view.querySelector(".response-referees");
      element.classList.toggle("pinnable", this.lockingJointSource);

      let visibility = element.childElementCount > 0;
      this.view.querySelector(".response-referees-container").hidden = !visibility;

      return visibility;
    }.bind(this)(),

    function () {
      let element = this.view.querySelector(".response-referees-suggestions");
      element.classList.toggle("pinnable", this.lockingJointSource);

      let visibility = element.childElementCount > 0 && this.lockingJointSource;
      this.view.querySelector(".response-referees-suggestions-container").hidden = !visibility;

      return visibility;
    }.bind(this)()

  ].some(identity);

  // Without any mentions and not yet published
  this.view.querySelector(".response-extra-hint-container").hidden = !(!showExtra && this.response.responseId < 0);

  // Without any mentions and published
  this.view.querySelector(".response-extra").hidden = !showExtra && this.response.responseId > 0;

};

MapResponseController.prototype.updateResponseReferees = function () {

  this.response.removeAllReferees();

  // Add pinned items
  Object.keys(this.pinnedRefereeJointSources).forEach(function (jointSourceId) {
    this.response.addReferee(jointSourceId);
  }.bind(this));

  Object.keys(this.mentionedJointSources).forEach(function (jointSourceId) {
    // Avoid hidden items
    if (!this.pinnedHiddenRefereeJointSources[jointSourceId]) {
      this.response.addReferee(jointSourceId);
    }
  }.bind(this));

};

MapResponseController.prototype.publish = function () {
  return this.response.publish("Publishing response...")
    .then(function () {

      this.updateView();
      this.componentOf.updateView(); // Signal creating new temporary comment instance

      // Display notification
      notifications.addNotification(new BasicNotification("Response published!"));
      notifications.didUpdate();
    }.bind(this))
    .catch(function (e) {
      console.warn(e);

      // Display notification
      notifications.addNotification(new BasicNotification("Failed to publish response", e ? e.message : undefined));
      notifications.didUpdate();
    });
};

MapResponseController.prototype.unpublish = function () {
  return new Promise(function (resolve, reject) {
    let prompt = new BasicPrompt(
      "Unpublishing the response...",
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
      return this.response.unpublish("Unpublishing response...");
    }.bind(this))
    .then(function () {
      this.response.destroy(true, true, true);

      // Display notification
      notifications.addNotification(new BasicNotification("Response unpublished!"));
      notifications.didUpdate();
    }.bind(this))
    .catch(function (e) {
      console.warn(e);

      // Display notification
      notifications.addNotification(new BasicNotification("Failed to unpublish response", e ? e.message : undefined));
      notifications.didUpdate();
    });
};

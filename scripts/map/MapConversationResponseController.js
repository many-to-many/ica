
var MapConversationResponseController = ResponseController.createComponent("MapConversationResponseController");

MapConversationResponseController.createViewFragment = function () {
  return cloneTemplate("#template-map-conversation-response");
};

// View

MapConversationResponseController.defineMethod("initView", function initView() {
  if (!this.view) return;

  var editor = this.view.querySelector("[data-ica-response-message]");
  this.quill = new Quill(editor, {
    modules: {
      toolbar: false
    },
    theme: "",
    placeholder: this.response.responseId < 0 ? "Post a new response here..." : ""
  });

  this.quill.on("text-change", function (delta, oldDelta, source) {
    if (source == "user") {
      this.response.message["0"] = this.quill.getText().replace(/\s*$/, "");
    }

    this.view.querySelector("[data-ica-action='publish-response']").hidden =
      !this.response.message["0"]
      || this.response.message["0"] == this.response._backup_message["0"];
  }.bind(this));

  if (this.response._authorId
    && this.response._authorId != ICA.accountId) {
    this.quill.enable(false);
  }

  this.view.querySelector("[data-ica-action='publish-response']").hidden = true;

  this.view.querySelector("[data-ica-action='publish-response']").addEventListener("click", function (e) {
    e.preventDefault();

    this.controller.publish();
  }.bind(this.view));

  this.view.querySelector("[data-ica-action='unpublish-response']").addEventListener("click", function (e) {
    e.preventDefault();

    this.controller.unpublish();
  }.bind(this.view));

});

MapConversationResponseController.defineMethod("updateView", function updateView() {
  if (!this.view) return;

  this.view.querySelector("[data-ica-action='unpublish-response']").hidden =
    this.response.responseId < 0
    || !this.response._authorId
    || this.response._authorId !== ICA.accountId;

  this.quill.setText(this.response.message["0"] ? this.response.message["0"] : "");

  this.view.querySelector("[data-ica-response-timestamp='authored']").textContent =
    this.response._timestampAuthored
    ? new Date(this.response._timestampAuthored * 1000) .toLocaleDateString("en-us")
    : "Draft";

  if (this.response._authorId) {
    this.response.getAuthor()
      .then(function (author) {
        if (!this.view) return;

        this.view.querySelector("[data-ica-response-author='name']").textContent = (author.name || "Anonymous")
          + (author.authorId == ICA.accountId ? " (me)" : "");
      }.bind(this));
  } else {
    this.view.querySelector("[data-ica-response-author]").textContent = "";
  }
});

MapConversationResponseController.prototype.publish = function () {
  return this.response.publish("Publishing response...")
    .then(function (response) {

      this.updateView();
      this.componentOf.updateView(); // Signal creating new temporary comment instance

      // Display notification
      notifications.addNotification(new BasicNotification("Response published!"));
      notifications.didUpdate();
    }.bind(this))
    .catch(function (err) {
      console.warn(err);

      // Display notification
      notifications.addNotification(new BasicNotification("Failed to publish response", err ? err.message : undefined));
      notifications.didUpdate();
    });
};

MapConversationResponseController.prototype.unpublish = function () {
  return new Promise(function (resolve, reject) {
    var prompt = new BasicPrompt(
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
    var fragment = BasicPromptController.createViewFragment();
    var element = fragment.querySelector(".prompt");
    document.body.appendChild(fragment);
    new BasicPromptController(prompt, element);
  }.bind(this))
    .then(function () {
      return this.response.unpublish("Unpublishing response...");
    }.bind(this))
    .then(function () {
      this.response.destroy(true, true, true, true);

      // Display notification
      notifications.addNotification(new BasicNotification("Response unpublished!"));
      notifications.didUpdate();
    }.bind(this))
    .catch(function (err) {
      console.warn(err);

      // Display notification
      notifications.addNotification(new BasicNotification("Failed to unpublish response", err ? err.message : undefined));
      notifications.didUpdate();
    });
};
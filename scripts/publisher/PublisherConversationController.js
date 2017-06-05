
var PublisherConversationController = ConversationController.createComponent("PublisherConversationController");

PublisherConversationController.createViewFragment = function () {
  return cloneTemplate("#template-publisher");
};

// Model

PublisherConversationController.defineMethod("initModel", function initModel() {
  if (!this.model) return;
  this.conversation.backup();
});

PublisherConversationController.defineMethod("uninitModel", function uninitModel() {
  if (!this.model) return;
  this.conversation.recover();
  this.conversation.didUpdate();
});

// View

PublisherConversationController.defineMethod("initView", function initView() {
  if (!this.view) return;

  document.body.style.overflow = "hidden"; // Disable background scrolling

  this.view.querySelectorAll("[data-ica-conversation-meta]").forEach(function (element) {
    // Event listeners
    element.addEventListener("change", function (e) {
      // User input change
      this.controller.conversation.meta[getElementProperty(element, "conversation-meta")] = getFormattedInputValue(element);
      this.controller.conversation.didUpdate();
    }.bind(this.view));
    element.addEventListener("ica-change", function (e) {
      // Simulated input change
      this.controller.conversation.meta[getElementProperty(element, "conversation-meta")] = getFormattedInputValue(element);
      this.controller.conversation.didUpdate();
    }.bind(this.view));

    // Init input values
    setInputValue(element, this.conversation.meta[getElementProperty(element, "conversation-meta")]);
  }.bind(this));

  this.view.querySelectorAll("[data-ica-action^='add-source']").forEach(function (element) {
    element.addEventListener("click", function (e) {
      e.preventDefault();

      switch (getElementProperty(element, "action")) {
      case "add-source/text":
        new TextSource(null, this.controller.conversation);
        break;
      case "add-source/image":
        new ImageSource(null, this.controller.conversation);
        break;
      case "add-source/audio":
        new AudioSource(null, this.controller.conversation);
        break;
      case "add-source/video":
        new VideoSource(null, this.controller.conversation);
        break;
      default:
        return;
      }
      this.controller.conversation.didUpdate();
    }.bind(this));
  }.bind(this.view));

  this.view.querySelector("[data-ica-action='abort']").addEventListener("click", function (e) {
    e.preventDefault();

    if (this.controller.conversation.conversationId < 0) {
      this.controller.conversation.destroy(true, true, true, true);
    } else {
      this.controller.destroy(true);
    }
  }.bind(this.view));

  this.view.querySelector("[data-ica-action='unpublish']").addEventListener("click", function (e) {
    e.preventDefault();

    this.controller.unpublish();
  }.bind(this.view));

  this.view.querySelector("[data-ica-action='publish']").addEventListener("click", function (e) {
    e.preventDefault();

    this.controller.publish();
  }.bind(this.view));
});

PublisherConversationController.defineMethod("updateView", function updateView() {
  if (!this.view) return;

  // Update views based on sources in joint source
  this.conversation.forEachSource(function (source) {
    var element = this.controller.view.querySelector("[data-ica-source-id='{0}']".format(source.sourceId));
    if (element) return;

    // Create new view
    var fragment;
    switch (source.constructor) {
    case ImageSource:
      fragment = PublisherImageSourceController.createViewFragment();
      element = fragment.querySelector(".publisher-source");
      this.querySelector(".publisher-sources").appendChild(element);
      new PublisherImageSourceController(source, element).componentOf = this.controller;
      break;
    case AudioSource:
      fragment = PublisherAudioSourceController.createViewFragment();
      element = fragment.querySelector(".publisher-source");
      this.querySelector(".publisher-sources").appendChild(element);
      new PublisherAudioSourceController(source, element).componentOf = this.controller;
      break;
    case VideoSource:
      fragment = PublisherVideoSourceController.createViewFragment();
      element = fragment.querySelector(".publisher-source");
      this.querySelector(".publisher-sources").appendChild(element);
      new PublisherVideoSourceController(source, element).componentOf = this.controller;
      break;
    case TextSource:
    default:
      fragment = PublisherTextSourceController.createViewFragment();
      element = fragment.querySelector(".publisher-source");
      this.querySelector(".publisher-sources").appendChild(element);
      new PublisherTextSourceController(source, element).componentOf = this.controller;
    }
  }.bind(this.view));

  // Display danger zone
  this.view.querySelector("[data-ica-conversation-filter='published']").hidden = this.conversation.conversationId < 0;
});

PublisherConversationController.defineMethod("uninitView", function uninitView() {
  document.body.style.overflow = ""; // Enable background scrolling

  if (!this.view) return;
});

PublisherConversationController.prototype.publish = function () {
  return this.conversation.publish("Publishing conversation...")
    .then(function (conversation) {
      if (conversation) {
        appController.explore.addItems([conversation]);
        appController.explore.didUpdate();
      }

      this.destroy(true);

      // Display notification
      notifications.addNotification(new BasicNotification("Conversation published!"));
      notifications.didUpdate();

    }.bind(this))
    .catch(function (err) {
      console.warn(err);

      // Display notification
      notifications.addNotification(new BasicNotification("Failed to publish conversation", err ? err.message : undefined));
      notifications.didUpdate();
    });
};

PublisherConversationController.prototype.unpublish = function () {
  return new Promise(function (resolve, reject) {
    var prompt = new BasicPrompt(
      "Unpublishing \"{0}\"...".format(this.conversation.meta.title),
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
      return this.conversation.unpublish("Unpublishing conversation...");
    }.bind(this))
    .then(function () {
      // Display notification
      notifications.addNotification(new BasicNotification("Conversation unpublished"));
      notifications.didUpdate();

      this.conversation.destroy(true, true, true, true);
    }.bind(this))
    .catch(function (err) {
      console.warn(err);

      // Display notification
      notifications.addNotification(new BasicNotification("Failed to unpublish conversation", err ? err.message : undefined));
      notifications.didUpdate();
    });
};

/*****/

function setInputValue(input, value) {
  switch (getElementProperty(input, "format")) {
  case "tokens":
    if (input.handler) {
      input.handler.tokens = value;
      input.handler.didUpdate();
    } else {
      input.value = value
          ? Array.isArray(value) ? value.join("; ") : value
          : "";
    }
    break;
  default:
    input.value = value || null;
  }
  input.click();
}

function getFormattedInputValue(input) {
  if (input) {
    switch (getElementProperty(input, "format")) {
    case "tokens":
      return input.handler.tokens;
    default:
      return input.value;
    }
  }
  return undefined;
}

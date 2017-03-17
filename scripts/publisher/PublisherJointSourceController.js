
var PublisherJointSourceController = JointSourceController.createComponent("PublisherJointSourceController");

PublisherJointSourceController.createViewFragment = function () {
  return cloneTemplate("#template-publisher");
};

// Model

PublisherJointSourceController.defineMethod("initModel", function initModel() {
  if (!this.model) return;
  this.jointSource.backup();
});

PublisherJointSourceController.defineMethod("uninitModel", function uninitModel() {
  if (!this.model) return;
  this.jointSource.recover();
  this.jointSource.didUpdate();
});

// View

PublisherJointSourceController.defineMethod("initView", function initView() {
  if (!this.view) return;

  document.body.style.overflow = "hidden"; // Disable background scrolling

  this.view.querySelectorAll("[data-ica-jointsource-meta]").forEach(function (element) {
    // Event listeners
    element.addEventListener("change", function (e) {
      // User input change
      this.controller.jointSource.meta[getElementProperty(element, "jointsource-meta")] = getFormattedInputValue(element);
      this.controller.jointSource.didUpdate();
    }.bind(this.view));
    element.addEventListener("ica-change", function (e) {
      // Simulated input change
      this.controller.jointSource.meta[getElementProperty(element, "jointsource-meta")] = getFormattedInputValue(element);
      this.controller.jointSource.didUpdate();
    }.bind(this.view));

    // Init input values
    setInputValue(element, this.jointSource.meta[getElementProperty(element, "jointsource-meta")]);
  }.bind(this));

  this.view.querySelectorAll("[data-ica-action^='add-source']").forEach(function (element) {
    element.addEventListener("click", function (e) {
      e.preventDefault();

      switch (getElementProperty(element, "action")) {
      case "add-source/text":
        new TextSource(null, this.controller.jointSource);
        break;
      case "add-source/image":
        new ImageSource(null, this.controller.jointSource);
        break;
      case "add-source/audio":
        new AudioSource(null, this.controller.jointSource);
        break;
      case "add-source/video":
        new VideoSource(null, this.controller.jointSource);
        break;
      default:
        return;
      }
      this.controller.jointSource.didUpdate();
    }.bind(this));
  }.bind(this.view));

  this.view.querySelector("[data-ica-action='abort']").addEventListener("click", function (e) {
    e.preventDefault();

    if (this.controller.jointSource.jointSourceId < 0) {
      this.controller.jointSource.destroy(true, true);
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

PublisherJointSourceController.defineMethod("updateView", function updateView() {
  if (!this.view) return;

  // Update views based on sources in joint source
  this.jointSource.forEachSource(function (source) {
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
});

PublisherJointSourceController.defineMethod("uninitView", function uninitView() {
  document.body.style.overflow = ""; // Enable background scrolling

  if (!this.view) return;
});

PublisherJointSourceController.prototype.publish = function () {
  return this.jointSource.publish()
    .then(function (jointSource) {
      if (jointSource) {
        appController.explore.addItems([jointSource]);
        appController.explore.didUpdate();
      }

      this.destroy(true);
      alert("Content published");
    }.bind(this))
    .catch(function (err) {
      // TODO: Alert boxes to be implemented
      console.warn(err);
      alert(err.message);
    });
};

PublisherJointSourceController.prototype.unpublish = function () {
  return this.jointSource.unpublish()
    .then(function () {
      alert("Content unpublished; to be available online for another week after deletion (recover not yet implemented)");
    })
    .catch(function (err) {
      // TODO: Alert boxes to be implemented
      console.warn(err);
      alert(err.message);
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
  return null;
}

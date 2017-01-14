
var PublisherJointSourceController = JointSourceController.createComponent("PublisherJointSourceController");

PublisherJointSourceController.createViewFragment = function () {
  return cloneTemplate("#template-publisher");
}

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
    element.addEventListener("change", function (e) {
      this.controller.jointSource.meta[getElementProperty(element, "jointsource-meta")] = getFormattedInputValue(element);
    }.bind(this));
  }.bind(this.view));

  this.view.querySelectorAll("[data-ica-action^='add-source']").forEach(function (element) {
    element.addEventListener("click", function (e) {
      e.preventDefault();

      switch (getElementProperty(element, "action")) {
        case "add-source/text":

          new TextSource(null, this.controller.jointSource);

          break;
        case "add-source/audio":

          new AudioSource(null, this.controller.jointSource);

          break;
        default:
          return;
      }
      // this.controller.jointSource.didUpdate();
      this.controller.modelDidUpdate();
    }.bind(this));
  }.bind(this.view));

  this.view.querySelector("[data-ica-action='abort']").addEventListener("click", function (e) {
    e.preventDefault();

    if (this.controller.jointSource.jointSourceId < 0) {
      this.controller.jointSource.destroy(true);
    } else {
      this.controller.destroy(true);
    }
  }.bind(this.view));

  this.view.querySelector("[data-ica-action='unpublish']").addEventListener("click", function (e) {
    e.preventDefault();

    this.controller.unpublish();
  }.bind(this.view));

  this.view.addEventListener("submit", function (e) {
    e.preventDefault();

    this.controller.publish();
  }.bind(this.view));
});

PublisherJointSourceController.defineMethod("updateView", function updateView() {
  if (!this.view) return;

  this.view.querySelectorAll("[data-ica-jointsource-meta]").forEach(function (input) {
    setInputValue(input, this.controller.jointSource.meta[getElementProperty(input, "jointsource-meta")]);
  }.bind(this.view));

  // Update views based on sources in joint source
  this.jointSource.forEachSource(function (source) {
    var element = this.controller.view.querySelector("[data-ica-source-id='{0}']".format(source.sourceId));
    if (element) return;

    // Create new view
    switch (source.constructor) {
      case TextSource:

        var fragment = PublisherTextSourceController.createViewFragment();
        var element = fragment.querySelector(".publisher-source");
        this.insertBefore(element, this.querySelector(".publisher-control"));
        new PublisherTextSourceController(source, element).componentOf = this.controller;

        break;
      case AudioSource:

        var fragment = PublisherAudioSourceController.createViewFragment();
        var element = fragment.querySelector(".publisher-source");
        this.insertBefore(element, this.querySelector(".publisher-control"));
        new PublisherAudioSourceController(source, element).componentOf = this.controller;

        break;
      default:
        return;
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
        explore.addItems([jointSource]);
        explore.didUpdate();
      }

      this.destroy(true);

      alert("Content published");
    }.bind(this), function (err) {
      // TODO: Alert boxes to be implemented
      alert(err.message);
    });
};

PublisherJointSourceController.prototype.unpublish = function () {
  return this.jointSource.unpublish()
    .then(function () {

      alert("Content unpublished; to be available online for another week after deletion (recover not yet implemented)");
    }, function (err) {
      // TODO: Alert boxes to be implemented
      alert(err.message);
    });
};

/*****/

function setInputValue(input, value) {
  switch (getElementProperty(input, "format")) {
    case "tokens":
      if (input.handler) {
        input.handler.tokens = value;
        input.handler.contentDidUpdate();
      } else {
        input.value = value.join("; ");
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
        break;
      default:
        return input.value;
    }
  }
  return null;
}

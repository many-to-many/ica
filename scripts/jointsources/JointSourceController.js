
/**
 * JointSourceController
 * Abstract view controller to display a jointSource, which may be Conversation, Discussion or Response.
 * @constructor
 */
let JointSourceController = SingleModelController.createComponent("JointSourceController");

JointSourceController.defineAlias("model", "jointSource");

// Model

JointSourceController.defineMethod("uninitModel", function uninitModel() {
  if (!this.model) return;

  // Try to release JointSource lock
  this.unlockJointSource();
});

// View

JointSourceController.defineMethod("initView", function updateView() {
  if (!this.view) return;

  setElementProperty(this.view, "jointsource-id", this.jointSource.jointSourceId);
});

JointSourceController.defineMethod("uninitView", function initView() {
  if (!this.view) return;

  removeElementProperty(this.view, "jointsource-id");
});

// Locks for JointSource editing
// Prevention of multiple controllers editing a same JointSource instance simultaneously

(function (JointSource, JointSourceController) {

  let locks = {};

  Object.defineProperty(JointSource.prototype, "locked", {
    get: function () {
      return !!locks[this.jointSourceId];
    }
  });

  JointSource.prototype.lock = function lock() {
    if (locks[this.jointSourceId]) return false;
    locks[this.jointSourceId] = true;
    return true;
  };

  JointSource.prototype.unlock = function unlock() {
    delete locks[this.jointSourceId];
    return true;
  };

  Object.defineProperty(JointSourceController.prototype, "lockingJointSource", {
    get: function () {
      return locks[this.jointSource.jointSourceId] === this.controllerId;
    }
  });

  JointSourceController.prototype.lockJointSource = function lockJointSource(force = false) {
    if (!this.model) return;

    if (locks[this.jointSource.jointSourceId] && !force) return false;
    locks[this.jointSource.jointSourceId] = this.controllerId;
    return true;
  };

  JointSourceController.prototype.unlockJointSource = function unlockJointSource() {
    if (!this.model) return;

    if (locks[this.jointSource.jointSourceId] === this.controllerId) {
      delete locks[this.jointSource.jointSourceId];
      return true;
    }
    return false;
  };

})(JointSource, JointSourceController);
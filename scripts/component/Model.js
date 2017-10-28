
let Model = Component.createComponent("Model");

Model.models = {count: 0};

Model.defineMethod("construct", function construct() {
  // Construct modelId
  Object.defineProperty(this, "modelId", {
    value: ++Model.models.count
  });
  Model.models[this.modelId] = this;
  // Construct controllers
  Object.defineProperty(this, "controllers", {
    value: {}
  });
  // Construct jointModels
  Object.defineProperty(this, "jointModels", {
    value: {}
  });
});

Model.defineMethod("destruct", function destruct() {
  // Destruct jointModels
  Object.values(this.jointModels).forEach(function (jointModel) {
    // Request jointModel to release model
    jointModel.releaseModel(this);
  }, this);
  // Destruct controllers
  Object.values(this.controllers).forEach(function (controller) {
    // Request controller to release model
    controller.releaseModel(this);
  }, this);
  // Destruct modelId
  delete Model.models[this.modelId];
});

Model.defineMethod("destroy", function destroy(destroyControllers = false, destroyViews = false) {
  if (destroyControllers) {
    // The controller to be destroyed with its view removed
    Object.values(this.controllers).forEach(function (controller) {
      controller.destroy(destroyViews);
    });
  }
});

// This function is used to propagate the content update event to controllers and jointModels
Model.defineMethod("didUpdate", function didUpdate() {
  // Broadcast controllers that the model itself was just updated
  Object.values(this.controllers).forEach(function (controller) {
    controller.modelDidUpdate(this);
  }, this);
  // Broadcast jointModels that the model itself was just updated
  Object.values(this.jointModels).forEach(function (jointModel) {
    jointModel.modelDidUpdate(this);
  }, this);
});

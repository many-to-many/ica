
var JointModel = Model.createComponent("JointModel");

JointModel.defineMethod("construct", function construct() {
  // Construct models
  Object.defineProperty(this, "models", {
    value: {}
  });
});

JointModel.defineMethod("modelDidUpdate", function modelDidUpdate(model) {
  
});

JointModel.defineMethod("retainModel", function retainModel(model) {
  // Hook on model
  model.jointModels[this.modelId] = this;
  // Remember models
  this.models[model.modelId] = model;
});

JointModel.defineMethod("releaseModel", function releaseModel(model) {
  // Release model hook so model would no longer send message to this model
  delete model.jointModels[this.modelId];
  // Forget model
  delete this.models[model.modelId];
});

JointModel.defineMethod("releaseAllModels", function releaseAllModels(model) {
  // Call to release hooks on all models
  for (var modelId in this.models) {
    this.releaseModel(this.models[modelId]);
  }
});

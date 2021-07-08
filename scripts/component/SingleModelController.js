
let SingleModelController = Controller.createComponent("SingleModelController");

SingleModelController.defineMethod("init", function init(model, view) {
  // Init model
  this._model = model;
  this.initModel(model);
  return [view];
});

SingleModelController.defineMethod("uninit", function uninit() {
  // Uninit model
  this.uninitModel();
  delete this._model;
});

// Model

Object.defineProperty(SingleModelController.prototype, "model", {
  get: function () {
    return this._model;
  },
  set: function (value) {
    if (this._model === value) return;
    this.uninitModel();
    this._model = value;
    this.initModel();
    this.updateView();
  }
});

SingleModelController.defineMethod("initModel", function initModel() {
  if (!this.model) return;
  this.retainModel(this.model);
});

SingleModelController.defineMethod("uninitModel", function uninitModel() {
  if (!this.model) return;
  this.releaseModel(this.model);
});

SingleModelController.defineMethod("releaseModel", function releaseModel(model) {
  if (model && model !== this.model) {
    return arguments;
  }
  delete this._model;
});

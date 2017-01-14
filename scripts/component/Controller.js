
var Controller = Component.createComponent("Controller");

Controller.controllers = {count: 0};

Controller.defineMethod("construct", function construct() {
  // Construct controllerId
  Object.defineProperty(this, "controllerId", {
    value: ++Component.components.count
  });
  Controller.controllers[this.controllerId] = this;
  // Construct models
  Object.defineProperty(this, "models", {
    value: {}
  });
});

Controller.defineMethod("init", function init(view) {
  // Init view
  this._view = view;
  this.initView();
  return [];
});

Controller.defineMethod("uninit", function uninit() {
  // Uninit view
  this.uninitView();
  delete this._view;
});

Controller.defineMethod("destruct", function destruct() {
  // Destruct models
  this.releaseAllModels();
  // Destruct controllerId
  delete Controller.controllers[this.controllerId];
  delete this.controllerId;
});

Controller.defineMethod("destroy", function destroy(destroyView = false) {
  // Destroy view
  if (destroyView) this.destroyView();
});

// Model

Controller.defineMethod("modelDidUpdate", function modelDidUpdate(model) {
  // console.group("Model did update");
  // console.log("Model:", model.constructor);
  // console.log("Controller:", this.constructor);
  this.updateView();
  // console.groupEnd();
});

Controller.defineMethod("retainModel", function retainModel(model) {
  // Hook on model
  model.controllers[this.controllerId] = this;
  // Remember models
  this.models[model.modelId] = model;
});

Controller.defineMethod("releaseModel", function releaseModel(model) {
  // Release model hook so model would no longer send message to this controller
  delete model.controllers[this.controllerId];
  // Forget model
  delete this.models[model.modelId];
});

Controller.defineMethod("releaseAllModels", function releaseAllModels(model) {
  // Call to release hooks on all models
  for (var modelId in this.models) {
    this.releaseModel(this.models[modelId]);
  }
});

// View

Object.defineProperty(Controller.prototype, "view", {
  get: function () {
    return this._view;
  },
  set: function (value) {
    if (this._view == value) return;
    this.uninitView();
    this._view = value;
    this.initView();
  }
});

Controller.defineMethod("initView", function initView(updateView = []) {
  if (!this.view) return;
  this.view.controller = this;
  setElementProperty(this.view, "controller-id", this.controllerId);
  init(this.view);
  if (updateView) this.updateView.apply(this, updateView);
});

Controller.defineMethod("updateView", function updateView() {
  if (!this.view) return;
  setElementProperty(this.view, "view-updated", getTimestamp());
});

Controller.defineMethod("uninitView", function uninitView() {
  if (!this.view) return;
  removeElementProperty(this.view, "controller-id");
  delete this.view.controller;
});

Controller.defineMethod("destroyView", function destroyView() {
  if (!this.view) return;
  this.uninitView();
  var parentNode = this.view.parentNode;
  parentNode.removeChild(this.view);
  delete this._view;
});

/*****/

function getTimestamp() {
  return Math.floor(new Date().getTime() / 1000);
}

function setElementProperty(element, property, value) {
  element.setAttribute("data-ica-" + property, value);
  element[property] = value;
}

function getElementProperty(element, property) {
  return element[property] || element.getAttribute("data-ica-" + property);
}

function getElementIntProperty(element, property) {
  return element[property] || parseInt(element.getAttribute("data-ica-" + property));
}

function removeElementProperty(element, property) {
  element.removeAttribute("data-ica-" + property);
  element[property] = undefined;
}

function cloneTemplate (selector) {
  var template = document.querySelector(selector);
  var element = document.importNode(template.content, true);
  return element;
}

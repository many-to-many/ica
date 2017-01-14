
// Helper functions

if (!String.prototype.format) {
  String.prototype.format = function() {
    var args = arguments;
    return this.replace(/{(\d+)}/g, function(match, number) {
      return typeof args[number] != "undefined"
        ? args[number]
        : match;
    });
  };
}

// Component

var Component = function () {
  this.create.apply(this, arguments);
};

Component.components = {count: 0};

Component.componentName = "Component";
Component.parentComponent = undefined;
Component.childComponents = [];

Component.toString = function () {
  if (this.parentComponent) {
    return "{0} => {1}".format(this.parentComponent.toString(), this.componentName);
  } else {
    return this.componentName;
  }
}

Component.logChildComponents = function () {
  console.group(this.componentName);
  for (var name in this.prototype._methods) {
    console.log(name);
  }
  this.childComponents.forEach(function (childComponent) {
    Component.logChildComponents.call(childComponent);
  });
  console.groupEnd();
}

Component.defineAlias = function (name, alias) {
  Object.defineProperty(this.prototype, alias, {
    get: function () {
      return this[name];
    },
    set: function (value) {
      this[name] = value;
    }
  });
};

Component.isMethodDefined = function (name) {
  return !!this.prototype[name];
}

Component.defineMethod = function (name, definition) {
  var thisComponent = this;

  // Define method under _methods
  this.prototype._methods[name] = definition;
  // Redefine method with applyMethod to call the user-defined method in _methods
  this.prototype[name] = function () {
    thisComponent.applyMethod.apply(thisComponent, [this, name, arguments]);
  };
};

Component.applyMethod = function (thisObject, name, args) {
  try {
    if (this.prototype._methods[name]) {
      var _args = this.prototype._methods[name].apply(thisObject, args);
    }
    if (this.parentComponent &&
      this.parentComponent.isMethodDefined(name)) {
      this.parentComponent.prototype[name].apply(thisObject, _args || args);
    }
  } catch (err) {
    console.group("Error applying method");
    console.log("Target:", thisObject);
    console.log("Method:", name);
    console.log("Arguments:", args);
    console.log("Error:", err);
    console.groupEnd();
  }
};

Component.createComponent = function (name) {
  // thisComponent to refer to on which the new component is based
  var thisComponent = this;
  // Create new component
  var Component = function () {
    return thisComponent.apply(this, arguments);
  };
  eval("Component = function {0}() { return thisComponent.apply(this, arguments); };".format(name)); // NB: Debug
  // Assign the new component with the user-defined name
  Object.defineProperty(Component, "name", {
    value: name
  });
  // Init new component
  Component.componentName = name;
  Component.parentComponent = thisComponent;
  Component.childComponents = [];
  // Clone static methods
  Component.isMethodDefined = thisComponent.isMethodDefined;
  Component.toString = thisComponent.toString;
  Component.defineAlias = thisComponent.defineAlias;
  Component.defineMethod = thisComponent.defineMethod;
  Component.applyMethod = thisComponent.applyMethod;
  Component.createComponent = thisComponent.createComponent;
  // Clone base component prototype
  Component.prototype = Object.create(thisComponent.prototype);
  Component.prototype.constructor = Component;
  Component.prototype._methods = {}; // Clear methods
  // Save the new component and return it
  thisComponent.childComponents.push(Component);
  return Component;
};

Component.prototype.constructor = Component;

Component.prototype._methods = {};

// This function is automatically called upon the creation of a new component instance, and it should not be extended
Component.defineMethod("create", function create() {
  this.construct();
  this.init.apply(this, arguments);
});

// Method construct sets up instance attributes that are independent of user arguments
Component.defineMethod("construct", function construct() {
  // Construct componentName
  Object.defineProperty(this, "componentName", {
    value: this.constructor.componentName
  });
  // Construct componentId
  Object.defineProperty(this, "componentId", {
    value: ++Component.components.count
  });
  Component.components[this.componentId] = this;
  // Construct components
  Object.defineProperty(this, "components", {
    value: {}
  });
});

// Method init initializes the instance with arguments passed by the user
Component.defineMethod("init", function init() {
  // TODO: Init componentOf
  this.initComponentOf();
});

// Method uninit cancels the effects from the method init
Component.defineMethod("uninit", function uninit() {
  // Uninit componentOf
  this.uninitComponentOf();
  delete this._componentOf;
});

// Method destruct tears down the instance, which should no longer be used to free memory
Component.defineMethod("destruct", function destruct() {
  // Destruct components (in destroy)

  // Destruct componentId
  delete Component.components[this.componentId];
});

// This function is called upon freeing the object and should not be extended
Component.defineMethod("destroy", function destroy() {
  // Destruct components
  for (var componentId in this.components) {
    this.components[componentId].destroy.apply(this.components[componentId], arguments);
  }
  this.uninit();
  this.destruct();
});

// ComponentOf

Object.defineProperty(Component.prototype, "componentOf", {
  get: function () {
    return this._componentOf;
  },
  set: function (value) {
    if (this._componentOf == value) return;
    this.uninitComponentOf();
    this._componentOf = value;
    this.initComponentOf();
  }
});

Component.defineMethod("initComponentOf", function initComponentOf() {
  if (!this.componentOf) return;
  this.componentOf.components[this.componentId] = this;
});

Component.defineMethod("uninitComponentOf", function uninitComponentOf() {
  if (!this.componentOf) return;
  delete this.componentOf.components[this.componentId];
});

// Components

Component.prototype.forEachComponent = function (callback) {
  for (var componentId in this.components) {
    callback(this.components[componentId]);
  }
}

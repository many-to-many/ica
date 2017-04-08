
var Routine = Component.createComponent("Routine");

Routine.defineMethod("construct", function () {
  // Construct private container
  Object.defineProperty(this, "_container", {
    value: {
      paused: true
    }
  });
});

Routine.defineMethod("init", function (func, interval, start = true) {
  // Init execute method
  var container = this._container;
  this._execute = function _execute() {
    func();

    if (!container.paused) {
      container.timeout = setTimeout(function () {
        window.requestAnimationFrame(_execute);
      }, interval);
    }
  };
  // Start routine
  if (start) this.start();
  return [];
});

Routine.defineMethod("uninit", function () {
  // End routine
  this.end();
});

Object.defineProperty(Routine.prototype, "paused", {
  get: function () {
    return this._container.paused;
  },
  set: function (value) {
    this._container.paused = value;
  }
});

Routine.prototype.start = function () {
  if (this.paused) {
    // Unfreeze the routine
    this.paused = false;
    // Execute the routine
    this._execute();
  }
};

Routine.prototype.end = function () {
  // Pause the routine
  this.paused = true;
  // Cancel interval limit
  clearTimeout(this._container.timeout);
};

Routine.prototype.restart = function () {
  this.end();
  this.start();
};

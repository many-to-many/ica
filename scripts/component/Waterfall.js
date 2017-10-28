
let Waterfall = Component.createComponent("Waterfall");

Waterfall.defineMethod("construct", function () {
  // Construct private container
  Object.defineProperty(this, "_container", {
    value: {
      then: []
    }
  });
});

Waterfall.defineMethod("init", function (func, duration = 0, start = true) {
  // Init execute method
  let container = this._container;
  this._execute = function () {
    if (func) func();

    setTimeout(function () {
      container.then.forEach(function (item) {
        item.start();
      });
    }, duration);
  };
  // Start waterfall
  if (start) this.start();
  return [];
});

Waterfall.prototype.start = function () {
  // Execute the function
  this._execute();
};

Waterfall.prototype.then = function (func, duration) {
  let next = new Waterfall(func, duration, false);
  this._container.then.push(next);
  return next;
};

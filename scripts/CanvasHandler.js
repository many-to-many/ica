
var CanvasHandler = ElementHandler.createComponent("CanvasHandler");

CanvasHandler.defineAlias("element", "canvas");

CanvasHandler.defineMethod("init", function init(canvas) {
  var style = window.getComputedStyle(canvas);
  this.canvasWidth = parseInt(style.width);
  this.canvasHeight = parseInt(style.height);
  canvas.style.width = this.canvasWidth + "px";
  canvas.style.height = this.canvasHeight + "px";
  canvas.width = this.canvasWidth * this.devicePixelRatio;
  canvas.height = this.canvasHeight * this.devicePixelRatio;
  this.canvasContext = canvas.getContext("2d");
});

CanvasHandler.prototype.clearRect = function (x, y, width, height) {
  this.canvasContext.clearRect(
    x * this.devicePixelRatio,
    y * this.devicePixelRatio,
    width * this.devicePixelRatio,
    height * this.devicePixelRatio);
}

CanvasHandler.prototype.rect = function (x, y, width, height) {
  this.canvasContext.rect(
    x * this.devicePixelRatio,
    y * this.devicePixelRatio,
    width * this.devicePixelRatio,
    height * this.devicePixelRatio);
};

CanvasHandler.prototype.moveTo = function (x, y) {
  this.canvasContext.moveTo(
    x * this.devicePixelRatio,
    y * this.devicePixelRatio);
};

CanvasHandler.prototype.arcTo = function (x1, y1, x2, y2, radius) {
  this.canvasContext.arcTo(
    x1 * this.devicePixelRatio,
    y1 * this.devicePixelRatio,
    x2 * this.devicePixelRatio,
    y2 * this.devicePixelRatio,
    radius * this.devicePixelRatio);
};

CanvasHandler.prototype.beginPath = function () {
  this.canvasContext.beginPath();
}

CanvasHandler.prototype.closePath = function () {
  this.canvasContext.closePath();
}

CanvasHandler.prototype.roundRect = function (x, y, width, height, radius = 0) {
  // From: http://stackoverflow.com/questions/1255512/how-to-draw-a-rounded-rectangle-on-html-canvas
  if (width < 2 * radius) radius = width / 2;
  if (height < 2 * radius) radius = height / 2;
  this.beginPath();
  this.moveTo(x + radius, y);
  this.arcTo(x + width, y,   x + width, y + height, radius);
  this.arcTo(x + width, y + height, x, y + height, radius);
  this.arcTo(x, y + height, x, y, radius);
  this.arcTo(x, y, x + width, y, radius);
  this.closePath();
}

CanvasHandler.prototype.fill = function () {
  this.canvasContext.fill();
};

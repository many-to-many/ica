
/**
 * DropHandler
 * @constructor
 */
let DropHandler = ElementHandler.createComponent("DropHandler");

DropHandler.defineMethod("init", function init(element, callback) {

  this.callback = callback;

  return [element];
});

DropHandler.defineMethod("initContent", function initContent() {

  this.element.addEventListener("drag", function (event) {
    event.preventDefault();
    event.stopPropagation();
  });

  this.element.addEventListener("dragstart", function (event) {
    event.preventDefault();
    event.stopPropagation();
  });

  this.element.addEventListener("dragend", function (event) {
    event.preventDefault();
    event.stopPropagation();

    // Cancel drag over
  });

  this.element.addEventListener("dragover", function (event) {
    event.preventDefault();
    event.stopPropagation();

    // Drag over
  });

  this.element.addEventListener("dragenter", function (event) {
    event.preventDefault();
    event.stopPropagation();

    // Drag over
  });

  this.element.addEventListener("dragleave", function (event) {
    event.preventDefault();
    event.stopPropagation();

    // Cancel drag over
  });

  this.element.addEventListener("drop", function (event) {
    event.preventDefault();
    event.stopPropagation();

    // Cancel drag over

    this.handler.callback(event.dataTransfer.files);
  }.bind(this.element));

});

DropHandler.defineMethod("uninitContent", function uninitContent() {

  // Remove event listeners

});

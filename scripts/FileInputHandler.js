
var FileInputHandler = ElementHandler.createComponent("FileInputHandler");

FileInputHandler.defineAlias("element", "input");

FileInputHandler.inputUpdated = function inputUpdated(e) {
  this.handler.contentDidUpdate();
};

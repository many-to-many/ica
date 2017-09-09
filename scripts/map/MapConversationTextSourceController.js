
/**
 * MapConversationTextSourceController
 * Concrete view controller to display a text source.
 * @constructor
 */
let MapConversationTextSourceController = MapConversationSourceController.createComponent("MapConversationTextSourceController");

MapConversationTextSourceController.createViewFragment = function () {
  return cloneTemplate("#template-map-conversation-textsource");
};

// View

MapConversationTextSourceController.defineMethod("initView", function initView() {
  if (!this.view) return;

  this.quill = new Quill(this.view.querySelector(".text"), {
    readOnly: true
  });

});

MapConversationTextSourceController.defineMethod("updateView", function updateView() {
  if (!this.view) return;

  this.quill.setText(this.source.content);

});

MapConversationTextSourceController.defineMethod("uninitView", function unitView() {
  if (!this.view) return;

  delete this.quill;

});

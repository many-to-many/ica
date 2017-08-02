
let MapConversationTextSourceController = MapConversationSourceController.createComponent("MapConversationTextSourceController");

MapConversationTextSourceController.createViewFragment = function () {
  return cloneTemplate("#template-map-conversation-textsource");
};

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

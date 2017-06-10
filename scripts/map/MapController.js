
var MapController = SingleModelController.createComponent("MapController");

MapController.createViewFragment = function () {
  return cloneTemplate("#template-map");
};

MapController.defineAlias("model", "map");

MapController.defineMethod("initView", function initView() {
  if (!this.view) return;

  this.view.addEventListener("click", function (e) {
    this.controller.destroy(true);
  }.bind(this.view));

  document.body.style.overflow = "hidden"; // Disable background scrolling
  // TODO: Document body controller to auto lock scrolling for ease of sub view navigation; this probably may not work well with publisher controller
});

MapController.defineMethod("updateView", function updateView() {
  if (!this.view) return;

  if (this.map.articles.length == 0) {
    this.destroy(true);
    return;
  }

  // Adding elements
  this.map.articles.map(function (article) {
    switch (article.constructor) {
    case Conversation:
      // Check existing element
      if (this.view.querySelector("[data-ica-conversation-id='{0}']".format(article.conversationId))) return;

      // Create new view
      var fragment = MapConversationController.createViewFragment();
      var element = fragment.querySelector(".article");
      this.view.appendChild(fragment);
      new MapConversationController(article, element).componentOf = this;
      break;
    }
  }.bind(this));
});

MapController.defineMethod("uninitView", function uninitView() {
  document.body.style.overflow = ""; // Enable background scrolling

  if (!this.view) return;
});

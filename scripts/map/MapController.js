
var MapController = SingleModelController.createComponent("MapController");

MapController.createViewFragment = function () {
  return cloneTemplate("#template-map");
};

MapController.defineAlias("model", "map");

MapController.defineMethod("initView", function initView() {
  if (!this.view) return;

  this.routerIndex = Router.index;

  Router.prepush(this);

  this.view.addEventListener("click", function () {
    Router.jump(this.controller.routerIndex);
  }.bind(this.view));

  this.lockBodyScrolling();
});

MapController.defineMethod("updateView", function updateView() {
  if (!this.view) return;

  if (this.map.articles.length === 0) {
    Router.jump(this.routerIndex);
    return;
  }

  // Adding elements
  this.map.articles.map(function (article) {
    // Check existing element
    if (this.view.querySelector("[data-ica-jointsource-id='{0}']".format(article.conversationId))) return;

    // Create new view
    var Controller;
    switch (article.constructor) {
    case Conversation: Controller = MapArticleConversationController; break;
    case Discussion: Controller = MapArticleDiscussionController; break;
    default: return;
    }
    var fragment = Controller.createViewFragment();
    var element = fragment.querySelector(".article");
    this.view.appendChild(fragment);
    new Controller(article, element).componentOf = this;
  }.bind(this));
});

MapController.defineMethod("hideView", function hideView() {
  this.unlockBodyScrolling();
});

MapController.defineMethod("unhideView", function unhideView() {
  this.lockBodyScrolling();
});

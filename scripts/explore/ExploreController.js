
var ExploreController = SingleModelController.createComponent("ExploreController");

ExploreController.defineAlias("model", "explore");

ExploreController.defineMethod("initView", function initView() {
  if (!this.view) return;

  this.viewItems = [];

  setElementProperty(this.view, "explore-id", this.explore.exploreId);
});

ExploreController.defineMethod("updateView", function updateView() {
  if (!this.view) return;

  this.viewItems = this.viewItems.filter(function (item) {
    if (this.explore.items.indexOf(item) > -1) return true;

    var element = this.view.querySelector("[data-ica-jointsource-id='{0}']".format(item.jointSourceId));
    if (element) {
      element.controller.destroy(true);
    }

    return false;
  }.bind(this));

  this.explore.items.reverse().forEach(function (item) {

    var Controller;
    switch (item.constructor) {
    case Conversation: Controller = ExploreConversationController; break;
    case Discussion: Controller = ExploreDiscussionController; break;
    default:
      console.warn("Unhandled item:", item.constructor);
      return;
    }

    // Check existing element
    if (this.view.querySelector("[data-ica-jointsource-id='{0}']".format(item.jointSourceId))) return;

    // Create new view
    var fragment = Controller.createViewFragment();
    var element = fragment.querySelector(".jointsource");
    this.view.insertBefore(fragment, this.firstChild);
    new Controller(item, element).componentOf = this.controller;

    this.viewItems.push(item);

  }.bind(this));
});

ExploreController.defineMethod("uninitView", function initView() {
  if (!this.view) return;

  delete this.viewItems;

  removeElementProperty(this.view, "explore-id");
});

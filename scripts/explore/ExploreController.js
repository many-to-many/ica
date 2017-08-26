
/**
 * ExploreController
 * Concrete view controller to display Explore items, arranged by order of publishing.
 * @constructor
 */
let ExploreController = SingleModelController.createComponent("ExploreController");

ExploreController.defineAlias("model", "explore");

ExploreController.defineMethod("initView", function initView() {
  if (!this.view) return;

  // Init viewItems
  // List to keep track of all items that should currently be in view
  // If some item is no longer expected to be displayed, remove its corresponding element in the view
  this.viewItems = [];

  setElementProperty(this.view, "explore-id", this.explore.exploreId);
});

ExploreController.defineMethod("updateView", function updateView() {
  if (!this.view) return;

  this.viewItems = this.viewItems.filter(function (item) {
    if (this.explore.items.indexOf(item) > -1) return true;

    // Try to remove the corresponding element since it's no longer in the explore set
    let element = this.view.querySelector("[data-ica-jointsource-id='{0}']".format(item.jointSourceId));
    if (element) element.controller.destroy(true);

    return false;
  }, this);

  this.explore.items.forEach(function (item) {

    let Controller;
    switch (item.constructor) {
      case Conversation: Controller = ExploreConversationController; break;
      case Discussion: Controller = ExploreDiscussionController; break;
      default: console.warn("Unhandled item:", item.constructor); return;
    }

    // Check existing element
    if (this.view.querySelector("[data-ica-jointsource-id='{0}']".format(item.jointSourceId))) return;

    // Create new view
    let fragment = Controller.createViewFragment();
    let element = fragment.querySelector(".jointsource");
    this.view.appendChild(fragment);
    new Controller(item, element).componentOf = this.controller; // Its order of display is controlled by this nested controller

    // Mark item as currently in view
    this.viewItems.push(item);

  }, this);
});

ExploreController.defineMethod("uninitView", function initView() {
  if (!this.view) return;

  // Uninit viewItems
  delete this.viewItems;

  removeElementProperty(this.view, "explore-id");
});

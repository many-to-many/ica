
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

    switch (item.constructor) {
    case JointSource:
      var jointSource = item;

      var element = this.view.querySelector("[data-ica-jointsource-id='{0}']".format(jointSource.jointSourceId));
      if (element) {
        element.controller.destroy(true);
      }
      break;
    }

    return false;
  }.bind(this));

  this.explore.items.reverse().map(function (item) {
    switch (item.constructor) {
    case JointSource:
      var jointSource = item;
      // Check existing element
      if (this.view.querySelector("[data-ica-jointsource-id='{0}']".format(jointSource.jointSourceId))) return;

      // Create new view
      var fragment = ExploreJointSourceController.createViewFragment();
      var element = fragment.querySelector(".jointsource");
      this.view.insertBefore(fragment, this.firstChild);
      new ExploreJointSourceController(jointSource, element).componentOf = this.controller;

      this.viewItems.push(item);

      break;
    default:
      console.warn("Unhandled item:", item.constructor);
    }
  }.bind(this));
});

ExploreController.defineMethod("uninitView", function initView() {
  if (!this.view) return;

  delete this.viewItems;

  removeElementProperty(this.view, "explore-id");
});

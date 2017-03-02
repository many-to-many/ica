
var ExploreController = SingleModelController.createComponent("ExploreController");

ExploreController.defineAlias("model", "explore");

ExploreController.defineMethod("initView", function initView() {
  if (!this.view) return;

  setElementProperty(this.view, "explore-id", this.explore.exploreId);
});

ExploreController.defineMethod("updateView", function updateView() {
  if (!this.view) return;

  this.explore.items.reverse().map(function (item) {
    switch (item.constructor) {
      case JointSource:
        var jointSource = item;
        // Check existing element
        if (this.querySelector("[data-ica-jointsource-id='{0}']".format(jointSource.jointSourceId))) break;

        // Create new view
        var fragment = ExploreJointSourceController.createViewFragment(jointSource);
        var element = fragment.querySelector(".jointsource");
        this.insertBefore(fragment, this.firstChild);
        new ExploreJointSourceController(jointSource, element).componentOf = this.controller;

        break;
      default:
        console.warn("Unhandled item:", item.constructor);
    }
  }.bind(this.view));
});

ExploreController.defineMethod("uninitView", function initView() {
  if (!this.view) return;

  removeElementProperty(this.view, "explore-id");
});

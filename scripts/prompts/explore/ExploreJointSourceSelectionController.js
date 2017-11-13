
let ExploreJointSourceSelectionController = SingleModelController.createComponent("ExploreJointSourceSelectionController");

ExploreJointSourceSelectionController.defineAlias("model", "explore");

ExploreJointSourceSelectionController.defineMethod("initView", function initView() {
  if (!this.view) return;

  this.viewItems = [];

  setElementProperty(this.view, "explore-id", this.explore.exploreId);
});

ExploreJointSourceSelectionController.defineMethod("updateView", function updateView() {
  if (!this.view) return;

  this.viewItems = this.viewItems.filter(function (item) {
    if (this.explore.items.indexOf(item) > -1) return true;

    var element = this.view.querySelector("[data-ica-jointsource-id='{0}']".format(item.jointSourceId));
    if (element) {
      element.controller.destroy(true);
    }

    return false;
  }.bind(this));

  this.explore.items.forEach(function (item) {

    let Controller;
    switch (item.constructor) {
      case Conversation: Controller = ExploreConversationController; break;
      case Discussion: Controller = ExploreDiscussionController; break;
      default:
        console.warn("Unhandled item:", item.constructor);
        return;
    }

    let element = this.view.querySelector("[data-ica-jointsource-id='{0}']".format(item.jointSourceId));

    // Check existing element
    if (!element) {

      // Create new view
      let fragment = Controller.createViewFragment();
      element = fragment.querySelector(".jointsource");
      this.view.appendChild(fragment);

      // Add event listener beforehand to so the controller would have a lower priority
      element.addEventListener("click", function () {
        event.preventDefault();
        event.stopImmediatePropagation();

        // Toggle selection
        if (this.componentOf) {
          let selected = this.componentOf.jointSourcesHandler.toggle(item);
          element.classList.toggle("selected", selected);
        }

      }.bind(this));

      let controller = new Controller(item, element);
      controller.componentOf = this;

      this.viewItems.push(item);

    }

    // element.classList.toggle("selected", !!this.componentOf.pinnedRefereeJointSources[item.jointSourceId]);

  }.bind(this));
});

ExploreJointSourceSelectionController.defineMethod("uninitView", function initView() {
  if (!this.view) return;

  delete this.viewItems;
});

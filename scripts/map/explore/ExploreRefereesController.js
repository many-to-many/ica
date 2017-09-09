
/**
 * ExploreRefereesController
 * Concrete view controller to display JointSources.
 * Note this is designed to only work with MapResponseController.
 * @constructor
 */
let ExploreRefereesController = SingleModelController.createComponent("ExploreRefereesController");

ExploreRefereesController.defineAlias("model", "jointSource");

ExploreRefereesController.defineMethod("initView", function initView() {
  if (!this.view) return;

  this.viewItems = [];

});

ExploreRefereesController.defineMethod("updateView", function updateView() {
  if (!this.view) return;

  this.viewItems = this.viewItems.filter(function (item) {
    if (this.jointSource.referees[item.jointSourceId]) return true;

    let element = this.view.querySelector("[data-ica-jointsource-id='{0}']".format(item.jointSourceId));
    if (element) {
      element.controller.destroy(true);
    }

    return false;
  }.bind(this));

  Promise.all(Object.values(this.jointSource.referees))
    .then(function (items) {

      items.forEach(function (item) {
        if (item === this.componentOf.componentOf.jointSource) return;

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
          let controller = new Controller(item, element);
          controller.componentOf = this;

          // element.addEventListener("click", function () {
          //   event.preventDefault();
          //   event.stopPropagation();
          //
          //   if (this.componentOf.componentOf.pinnedRefereeJointSources[item.jointSourceId]) {
          //     delete this.componentOf.componentOf.pinnedRefereeJointSources[item.jointSourceId];
          //     this.view.classList.remove("pinned");
          //   } else {
          //     this.componentOf.componentOf.pinnedRefereeJointSources[item.jointSourceId] = item;
          //     this.view.classList.add("pinned");
          //   }
          //
          //   console.log(this.componentOf.componentOf.pinnedRefereeJointSources, this.componentOf.componentOf.pinnedHiddenRefereeJointSources);
          //
          //   this.componentOf.componentOf.updateResponseReferees();
          //
          //   this.componentOf.jointSource.didUpdate();
          // }.bind(controller), true);

          this.viewItems.push(item);

        }

        element.classList.toggle("pinned", !!this.componentOf.pinnedRefereeJointSources[item.jointSourceId]);

      }, this);

      this.componentOf.updateViewExtraVisibility();

    }.bind(this));

});

ExploreRefereesController.defineMethod("uninitView", function initView() {
  if (!this.view) return;

  delete this.viewItems;

});

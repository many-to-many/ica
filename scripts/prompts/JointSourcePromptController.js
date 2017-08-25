
let JointSourcePromptController = PromptController.createComponent("JointSourcePromptController");

JointSourcePromptController.createViewFragment = function () {
  return cloneTemplate("#template-prompt-jointsource");
};

JointSourcePromptController.defineMethod("initView", function initView() {
  if (!this.view) return;

  this.jointSourcesHandler = new JointSourcesHandler();

  // Explore

  // Conversations

  this.exploreConversations = new Explore();
  new ExploreJointSourceSelectionController(
    this.exploreConversations,
    this.view.querySelector("[data-ica-subview='conversations'] .explore")
  ).componentOf = this;

  ICA.getConversations()
    .then(function (conversations) {
      this.exploreConversations.requestNext = conversations.requestNext;
      this.exploreConversations.addItems(conversations);
      this.exploreConversations.didUpdate();
    }.bind(this), function (err) {
      console.warn(err);
    });

  // Discussions

  this.exploreDiscussions = new Explore();
  new ExploreJointSourceSelectionController(
    this.exploreDiscussions,
    this.view.querySelector("[data-ica-subview='discussions'] .explore")
  ).componentOf = this;

  ICA.getDiscussions()
    .then(function (discussions) {
      this.exploreDiscussions.requestNext = discussions.requestNext;
      this.exploreDiscussions.addItems(discussions);
      this.exploreDiscussions.didUpdate();
    }.bind(this), function (err) {
      console.warn(err);
    });

  // Pagination

  new Routine(function () {
    this.view.querySelectorAll(".conversations, .discussions").forEach(function (element) {
      if (element.hidden) return;
      element = element.querySelector(".explore");

      let rect = element.getBoundingClientRect();
      let explore = element.controller.explore;

      if (rect.bottom < 2 * document.body.offsetHeight
        && explore.requestNext) {
        // Need to load more content

        console.count("Need to load more");
        let requestNext = explore.requestNext;
        explore.requestNext = undefined;

        requestNext()
          .then(function (conversations) {
            explore.requestNext = conversations.requestNext;
            explore.addItems(conversations);
            explore.didUpdate();
          }.bind(element), function (err) {
            if (err instanceof ICA.APIResponse.EndOfResponse) {
              // End of response
              console.log("AppJointSourcesController: End of response");
            } else {
              // Critical error
              console.error(err.message);
            }
          });

        element.classList.toggle("loading", true);
      } else {
        element.classList.toggle("loading", false);
      }
    });
  }.bind(this), 500, true)
    .componentOf = this;

  // View selection

  this.view.querySelectorAll("[data-ica-for-subview]").forEach(function (element) {
    let subview = getElementProperty(element, "for-subview");

    element.addEventListener("click", function () {
      event.preventDefault();

      this.querySelectorAll("[data-ica-for-subview]").forEach(function (element) {
        element.classList.toggle("active", getElementProperty(element, "for-subview") === subview);
      });

      this.querySelectorAll("[data-ica-subview]").forEach(function (element) {
        element.hidden = getElementProperty(element, "subview") !== subview;
      });
    }.bind(this.view));
  }.bind(this));

  // Use first one as default
  this.view.querySelector("[data-ica-for-subview]").click();

});

/***/

function promptJointSourceSelection() {
  return new Promise(function (resolve, reject) {
    let prompt = new Prompt([
      new PromptAction(
        "Cancel",
        function () {
          resolve([]);
        }
      ),
      new PromptAction(
        "Select",
        function () {
          resolve(controller.jointSourcesHandler.jointSources);
        },
        true
      )
    ]);

    let fragment = JointSourcePromptController.createViewFragment();
    let element = fragment.querySelector(".prompt");
    document.body.appendChild(fragment);
    let controller = new JointSourcePromptController(prompt, element);
  });
}

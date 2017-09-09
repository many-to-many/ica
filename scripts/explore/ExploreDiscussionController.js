
/**
 * ExploreDiscussionController
 * Concrete view controller to display a Discussion.
 * @constructor
 */
let ExploreDiscussionController = ConversationController.createComponent("ExploreDiscussionController");

ExploreDiscussionController.createViewFragment = function createViewFragment() {
  return cloneTemplate("#template-explore-discussion");
};

ExploreDiscussionController.defineAlias("model", "discussion");

(function (ExploreDiscussionController) {

  ExploreDiscussionController.defineMethod("initView", function initView() {
    if (!this.view) return;

    // Init click to display full article

    this.view.addEventListener("click", viewOnClick);

    setElementProperty(this.view, "discussion-id", this.discussion.discussionId);
  });

  ExploreDiscussionController.defineMethod("updateView", function updateView() {
    if (!this.view) return;

    // Update display metadata

    this.view.querySelectorAll("[data-ica-discussion]").forEach(function (element) {
      element.textContent = this.discussion[getElementProperty(element, "discussion")]["0"] || "";
    }.bind(this));

    // Display order

    this.view.style.order = -this.discussion.discussionId;

  });

  ExploreDiscussionController.defineMethod("uninitView", function uninitView() {
    if (!this.view) return;

    // Uninit click to display full article

    this.view.removeEventListener("click", viewOnClick);

    removeElementProperty(this.view, "discussion-id");
  });

  // Shared functions

  function viewOnClick(event) {
    event.preventDefault();
    event.stopPropagation();

    let fragment = MapArticleDiscussionController.createViewFragment();
    let element = fragment.querySelector(".article-container");

    document.body.querySelector(".app-view").appendChild(fragment);
    new MapArticleDiscussionController(this.controller.discussion, element);
  }

}(ExploreDiscussionController));

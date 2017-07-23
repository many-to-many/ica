
var ExploreDiscussionController = ConversationController.createComponent("ExploreDiscussionController");

ExploreDiscussionController.createViewFragment = function () {
  return cloneTemplate("#template-explore-discussion");
};

ExploreDiscussionController.defineAlias("model", "discussion");

ExploreDiscussionController.defineMethod("initView", function initView() {
  if (!this.view) return;

  setElementProperty(this.view, "discussion-id", this.discussion.discussionId);
  this.view.style.order = -this.discussion.discussionId;

  this.view.addEventListener("click", function (e) {
    e.preventDefault();
    e.stopPropagation();
    var fragment = MapArticleDiscussionController.createViewFragment();
    var element = fragment.querySelector(".article-container");
    document.body.querySelector(".app-view").appendChild(fragment);
    new MapArticleDiscussionController(this.controller.discussion, element);
  }.bind(this.view));
});

ExploreDiscussionController.defineMethod("updateView", function updateView() {
  if (!this.view) return;

  this.view.querySelectorAll("[data-ica-discussion]").forEach(function (element) {
    element.textContent = this.discussion[getElementProperty(element, "discussion")]["0"] || "";
  }.bind(this));
});

ExploreDiscussionController.defineMethod("uninitView", function uninitView() {
  if (!this.view) return;

  removeElementProperty(this.view, "discussion-id");
});

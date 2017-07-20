
var MapArticleDiscussionController = MapArticleController.createComponent("MapArticleDiscussionController");

MapArticleDiscussionController.createViewFragment = function () {
  return cloneTemplate("#template-map-article-discussion");
};

MapArticleDiscussionController.defineAlias("jointSource", "discussion");

MapArticleDiscussionController.defineMethod("init", function (jointSource, view) {
  this.jointSourceController = new MapDiscussionController(jointSource);
});

MapArticleDiscussionController.defineMethod("initView", function initView() {
  if (!this.view) return;

  Router.push(this, "/discussions/" + this.discussion.discussionId, "Discussion | Many-to-Many");

  // Discussion controller
  {
    let node = this.view.querySelector(".jointsource");
    let parentNode = node.parentNode;
    let fragment = MapDiscussionController.createViewFragment();
    let element = fragment.querySelector(".jointsource");
    parentNode.replaceChild(fragment, node);
    this.jointSourceController.view = element;
  }

  // Responses in discussion

  let renderResponses = function (responses) {

    for (let response of responses.reverse()) {
      let element = this.view.querySelector("[data-ica-response-id='{0}']".format(response.responseId));
      if (!element) {
        let fragment = MapResponseController.createViewFragment();
        element = fragment.querySelector(".response");
        let parentNode = this.view.querySelector(".thread");
        parentNode.insertBefore(fragment, parentNode.firstElementChild);
        new MapResponseController(response, element).componentOf = this;
      }
    }

    if (responses.requestNext) {
      responses.requestNext().then(renderResponses, console.warn);
    }
  }.bind(this);

  this.discussion.getResponsesInDiscussion()
    .then(renderResponses, console.warn);

});

MapArticleDiscussionController.defineMethod("updateView", function updateView() {

  // Responses in discussion

  // Draft response
  this.touchNewResponseInDiscussion();

});

MapArticleDiscussionController.prototype.touchNewResponseInDiscussion = function () {
  if (this.draftResponseInDiscussion && this.draftResponseInDiscussion.responseId >= 0) {
    this.draftResponseInDiscussion = undefined;
  }
  if (!this.draftResponseInDiscussion) {
    // Create draft response and link reference to conversation
    this.draftResponseInDiscussion = new Response(undefined);
    JointSource.addJointSourceReference(this.draftResponseInDiscussion.responseId, this.discussion.discussionId);

    let fragment = MapResponseController.createViewFragment();
    let element = fragment.querySelector(".response");
    this.view.querySelector(".thread").appendChild(fragment);
    new MapResponseController(this.draftResponseInDiscussion, element).componentOf = this;
  }
};

/**
 * MapArticleDiscussionController
 * Concrete view controller to display a discussion board.
 * @constructor
 */
let MapArticleDiscussionController = MapArticleController.createComponent("MapArticleDiscussionController");

MapArticleDiscussionController.createViewFragment = function createViewFragment() {
  return cloneTemplate("#template-map-article-discussion");
};

MapArticleDiscussionController.defineAlias("jointSource", "discussion");

MapArticleDiscussionController.defineMethod("init", function init(jointSource) {
  this.jointSourceController = new MapDiscussionController(jointSource);
});

// View

MapArticleDiscussionController.defineMethod("initView", function initView() {
  if (!this.view) return;

  // Push history state
  Router.push(this, "/discussions/" + this.discussion.discussionId, "Discussion | Many-to-Many");

  // Discussion controller
  {
    let fragment = MapDiscussionController.createViewFragment();
    let element = fragment.querySelector(".jointsource");
    let oldElement = this.view.querySelector(".jointsource");
    oldElement.parentNode.replaceChild(fragment, oldElement);
    this.jointSourceController.view = element;
  }

  // Responses in discussion

  let threadElement = this.view.querySelector(".thread");

  this.discussion.getResponsesInDiscussion()
    .then(function renderResponses(responses) {

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
        responses.requestNext().then(renderResponses, function (e) {
          if (e instanceof ICA.APIResponse.EndOfResponse) {
            // End of response
            console.log("MapArticleDiscussionController: End of response");
          } else {
            // Critical error
            console.error(e.message);
          }

          threadElement.classList.toggle("loading", false);
        }.bind(this));
      } else {
        threadElement.classList.toggle("loading", false);
      }
    }.bind(this), console.warn);

  threadElement.classList.toggle("loading", true);

});

MapArticleDiscussionController.defineMethod("updateView", function updateView() {
  if (!this.view) return;

  // Draft response
  this.touchNewResponseInDiscussion();

});

MapArticleDiscussionController.prototype.touchNewResponseInDiscussion = function touchNewResponseInDiscussion() {

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
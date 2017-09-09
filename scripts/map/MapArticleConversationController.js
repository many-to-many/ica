
/**
 * MapArticleConversationController
 * Concrete view controller to display a conversation board.
 * @constructor
 */
let MapArticleConversationController = MapArticleController.createComponent("MapArticleConversationController");

MapArticleConversationController.createViewFragment = function createViewFragment() {
  return cloneTemplate("#template-map-article-conversation");
};

MapArticleConversationController.defineAlias("jointSource", "conversation");

MapArticleConversationController.defineMethod("init", function init(jointSource) {
  this.jointSourceController = new MapConversationController(jointSource);
});

// View

(function (MapArticleConversationController) {

  MapArticleConversationController.defineMethod("initView", function initView() {
    if (!this.view) return;

    // Push history state
    Router.push(this, "/conversations/" + this.conversation.conversationId, "Conversation | Many-to-Many");

    // Conversation controller
    {
      let fragment = MapConversationController.createViewFragment();
      let element = fragment.querySelector(".jointsource");
      let oldElement = this.view.querySelector(".jointsource");
      oldElement.parentNode.replaceChild(fragment, oldElement);
      this.jointSourceController.view = element;
    }

    // Responses

    this.conversation.getResponses()
      .then(function (responses) {
        this.requestNext = responses.requestNext;

        renderResponses(this, responses);
      }.bind(this), function (err) {
        console.error(err.message);
      });

    // Pagination

    let responsesElement = this.view.querySelector(".responses");

    new Routine(function () {
      let element = responsesElement;
      let rect = element.getBoundingClientRect();

      if (rect.bottom < 2 * document.body.offsetHeight
        && this.requestNext) {
        // Need to load more content
        console.count("Need to load more");

        let requestNext = this.requestNext;
        this.requestNext = undefined;
        requestNext()
          .then(function (responses) {
            this.requestNext = responses.requestNext;

            renderResponses(this, responses);
          }.bind(this), function (err) {
            if (err instanceof ICA.APIResponse.EndOfResponse) {
              // End of response
              console.log("MapArticleConversationController: End of response");
            } else {
              // Critical error
              console.error(err.message);
            }

            element.classList.toggle("loading", false);
          });
      }
    }.bind(this), 500, true)
      .componentOf = this;

    responsesElement.classList.toggle("loading", true);

  });

  // Shared functions

  function renderResponses(controller, responses) {
    if (!controller.view) return;

    for (let response of responses.reverse()) {
      let element = controller.view.querySelector("[data-ica-response-id='{0}']".format(response.responseId));
      if (element) continue;

      let fragment = MapResponseController.createViewFragment();
      element = fragment.querySelector(".response");
      controller.view.querySelector(".responses").appendChild(fragment);
      new MapResponseController(response, element).componentOf = controller;
    }

  }

}(MapArticleConversationController));

MapArticleConversationController.defineMethod("updateView", function initView() {
  if (!this.view) return;

  // Draft response
  this.touchNewResponse();

});

MapArticleConversationController.defineMethod("uninitView", function uninitView() {
  if (!this.view) return;

  // Destroy temporary comment
  JointSource.removeJointSourceReference(this.conversation.conversationId, this.draftResponse.responseId);
  this.draftResponse.destroy(true, true, true);
  delete this.draftResponse;

});

MapArticleConversationController.prototype.touchNewResponse = function touchNewResponse() {
  if (!this.view) return;

  if (this.draftResponse && this.draftResponse.responseId >= 0) {
    this.draftResponse = undefined;
  }

  if (!this.draftResponse) {
    // Create draft response and link reference to conversation
    this.draftResponse = new Response();
    JointSource.addJointSourceReference(this.conversation.conversationId, this.draftResponse.responseId);

    let fragment = MapResponseController.createViewFragment();
    let element = fragment.querySelector(".response");
    let responsesElement = this.view.querySelector(".responses");
    if (responsesElement.firstElementChild) {
      responsesElement.insertBefore(fragment, responsesElement.firstElementChild);
    } else {
      responsesElement.appendChild(fragment);
    }
    new MapResponseController(this.draftResponse, element).componentOf = this;
  }

};

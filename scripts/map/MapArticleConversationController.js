
var MapArticleConversationController = MapArticleController.createComponent("MapArticleConversationController");

MapArticleConversationController.createViewFragment = function () {
  return cloneTemplate("#template-map-article-conversation");
};

MapArticleConversationController.defineAlias("jointSource", "conversation");

MapArticleConversationController.defineMethod("init", function (jointSource, view) {
  this.jointSourceController = new MapConversationController(jointSource);
});

MapArticleConversationController.defineMethod("initView", function initView() {
  if (!this.view) return;

  // Conversation controller
  {
    let node = this.view.querySelector(".jointsource");
    let parentNode = node.parentNode;
    let fragment = MapConversationController.createViewFragment();
    let element = fragment.querySelector(".jointsource");
    parentNode.replaceChild(fragment, node);
    this.jointSourceController.view = element;
  }

  // Responses

  this.conversation.getResponses()
    .then(function (responses) {
      if (!this.view) return;

      for (var response of responses.reverse()) {
        var element = this.view.querySelector("[data-ica-response-id='{0}']".format(response.responseId));
        if (!element) {
          var fragment = MapResponseController.createViewFragment();
          element = fragment.querySelector(".response");
          this.view.querySelector(".responses").appendChild(fragment);
          new MapResponseController(response, element).componentOf = this;
        }
      }
    }.bind(this), console.warn);

  // Draft response
  {
    this.draftResponse = new Response();
    JointSource.addJointSourceReference(this.conversation.conversationId, this.draftResponse.responseId);
    let fragment = MapResponseController.createViewFragment();
    let element = fragment.querySelector(".response");
    this.view.querySelector(".responses").appendChild(fragment);
    new MapResponseController(this.draftResponse, element).componentOf = this;
  }

});

MapArticleConversationController.defineMethod("updateView", function initView() {
  if (!this.view) return;

  // Responses

  // Temporary response
  if (this.draftResponse && this.draftResponse.responseId >= 0) {
    this.draftResponse = undefined;
  }
  if (!this.draftResponse) {
    // Create draft response and link reference to conversation
    this.draftResponse = new Response(undefined);
    JointSource.addJointSourceReference(this.conversation.conversationId, this.draftResponse.responseId);

    var fragment = MapResponseController.createViewFragment();
    var element = fragment.querySelector(".response");
    this.view.querySelector(".responses").insertBefore(fragment, this.view.querySelector(".responses").firstElementChild);
    new MapResponseController(this.draftResponse, element).componentOf = this;
  }

});

MapArticleConversationController.defineMethod("uninitView", function uninitView() {
  if (!this.view) return;

  // Destroy temporary comment
  JointSource.removeJointSourceReference(this.conversation.conversationId, this.draftResponse.responseId);
  this.draftResponse.destroy(true, true, true);
  delete this.draftResponse;
});
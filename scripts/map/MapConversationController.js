
/**
 * MapConversationController
 * Concrete view controller to display a Conversation.
 * @constructor
 */
let MapConversationController = ConversationController.createComponent("MapConversationController");

MapConversationController.createViewFragment = function createViewFragment() {
  return cloneTemplate("#template-map-conversation");
};

// View

(function (MapConversationController) {

  MapConversationController.defineMethod("initView", function initView() {
    if (!this.view) return;

    this.view.addEventListener("click", viewOnClick);

    let editConversationAnchor = this.view.querySelector("[data-ica-action='edit-conversation']");
    editConversationAnchor.href = "/conversations/{0}/edit".format(this.conversation.conversationId);
    editConversationAnchor.addEventListener("click", editConversationAnchorOnClick);
    editConversationAnchor.controller = this;

    // Slides
    // TODO: Redesign the UI & interaction for this part

    let sourcesElement = this.view.querySelector(".sources");
    let sourceElement = sourcesElement.querySelector(".source");

    let sourceElementUpdated = function () {
      let sourceIndex;
      for (let [index, element] of Object.entries(this.children)) {
        if (element === sourceElement) {
          sourceIndex = parseInt(index);
          break;
        }
      }

      this.parentNode.parentNode.querySelector("[data-ica-conversation-source-index]").textContent = (sourceIndex + 1).toString();
      this.parentNode.parentNode.querySelector("[data-ica-action='previous-source']").style.opacity = sourceElement.previousElementSibling ? 1 : 0;
      this.parentNode.parentNode.querySelector("[data-ica-action='next-source']").style.opacity = sourceElement.nextElementSibling ? 1 : 0;
    }.bind(sourcesElement);
    this.sourceElementUpdated = sourceElementUpdated;

    this.view.querySelector("[data-ica-action='previous-source']").addEventListener("click", function (event) {
      event.preventDefault();

      if (sourceElement.previousElementSibling) {
        sourceElement.style.display = "none";
        sourceElement = sourceElement.previousElementSibling;
        sourceElement.style.display = "";
        sourceElementUpdated();
      }

    }.bind(sourcesElement));

    this.view.querySelector("[data-ica-action='next-source']").addEventListener("click", function (event) {
      event.preventDefault();

      if (sourceElement.nextElementSibling) {
        sourceElement.style.display = "none";
        sourceElement = sourceElement.nextElementSibling;
        sourceElement.style.display = "";
        sourceElementUpdated();
      }

    }.bind(sourcesElement));

    // Tokens

    new TokensController(this.conversation.metaParticipantsHandler, this.view.querySelector("[data-ica-conversation-meta='participants']")).componentOf = this;
    new TokensController(this.conversation.metaThemesHandler, this.view.querySelector("[data-ica-conversation-meta='themes']")).componentOf = this;

    // Quill

    this.quillIntro = new Quill(this.view.querySelector("[data-ica-conversation-meta='intro']"), {
      readOnly: true
    });

    this.quillOthers = new Quill(this.view.querySelector("[data-ica-conversation-meta='others']"), {
      readOnly: true
    });

  });

  MapConversationController.defineMethod("updateView", function updateView() {
    if (!this.view) return;

    // Set display style for metadata
    this.view.querySelectorAll("[data-ica-conversation-meta-predicate]").forEach(function (element) {
      let metaPredicate = getElementProperty(element, "conversation-meta-predicate");
      element.style.display = isEmpty(this.conversation.meta[metaPredicate]) ? "none" : "";
    }.bind(this));

    this.view.querySelectorAll("[data-ica-conversation-meta]").forEach(function (element) {
      let content = this.conversation.meta[getElementProperty(element, "conversation-meta")];

      switch (getElementProperty(element, "conversation-meta")) {
        case "intro": this.quillIntro.setText(content || ""); break;
        case "others": this.quillOthers.setText(content || ""); break;
        default: element.textContent = content;
      }
    }.bind(this));

    this.view.querySelector(".conversation-backdrop").hidden = true;
    let imageSources = this.conversation.imageSources;
    if (imageSources.length > 0) {
      let imageSource = imageSources[0];

      if (imageSource.content) {
        this.view.querySelector(".conversation-backdrop").hidden = false;

        let backdropImageElement = this.view.querySelector(".conversation-backdrop-image");
        let backgroundImage = imageSource.content
          ? "url(" + (
          imageSource.fileHandler.blob instanceof Blob
            ? imageSource.fileHandler.url
            : imageSource.fileHandler.url + "?width=" + (backdropImageElement.offsetWidth * this.devicePixelRatio)
            + "&height=" + (backdropImageElement.offsetHeight * this.devicePixelRatio)
        ) + ")"
          : "";
        if (backdropImageElement.style.backgroundImage !== backgroundImage)
          backdropImageElement.style.backgroundImage = backgroundImage;
      }
    }

    this.conversation.forEachSource(function (source) {
      if (this.querySelector("[data-ica-source-id='{0}']".format(source.sourceId))) return;

      let fragment, element;
      switch (source.constructor) {
        case ImageSource:
          fragment = MapConversationImageSourceController.createViewFragment();
          element = fragment.querySelector(".source");
          this.querySelector(".sources").appendChild(fragment);
          new MapConversationImageSourceController(source, element).componentOf = this.controller;
          break;
        case AudioSource:
          fragment = MapConversationAudioSourceController.createViewFragment();
          element = fragment.querySelector(".source");
          this.querySelector(".sources").appendChild(fragment);
          new MapConversationAudioSourceController(source, element).componentOf = this.controller;
          break;
        case VideoSource:
          fragment = MapConversationVideoSourceController.createViewFragment();
          element = fragment.querySelector(".source");
          this.querySelector(".sources").appendChild(fragment);
          new MapConversationVideoSourceController(source, element).componentOf = this.controller;
          break;
        case TextSource:
        default:
          fragment = MapConversationTextSourceController.createViewFragment();
          element = fragment.querySelector(".source");
          this.querySelector(".sources").appendChild(fragment);
          new MapConversationTextSourceController(source, element).componentOf = this.controller;
      }

      element.style.display = "none";
    }.bind(this.view));

    this.sourceElementUpdated();
    this.view.querySelector("[data-ica-conversation-number-of-sources]").textContent = this.conversation.getNumberOfSources() + 1;

  });

  MapConversationController.prototype.displayPublisherConversationView = function displayPublisherConversationView() {
    let fragment = PublisherConversationController.createViewFragment();
    let element = fragment.querySelector(".publisher-container");
    document.body.querySelector(".app-view").appendChild(fragment);
    new PublisherConversationController(this.conversation, element);
  };

  // Shared functions

  function viewOnClick(event) {
    event.stopPropagation();
  }

  function editConversationAnchorOnClick(event) {
    event.preventDefault();

    this.controller.displayPublisherConversationView();
  }

})(MapConversationController);

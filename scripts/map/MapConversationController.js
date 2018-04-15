
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

    let editJointSourceAnchor = this.view.querySelector("[data-ica-action='edit-jointsource']");
    editJointSourceAnchor.href = "/conversations/{0}/edit".format(this.conversation.conversationId);
    editJointSourceAnchor.addEventListener("click", editJointSourceAnchorOnClick);
    editJointSourceAnchor.controller = this;

    // Tokens

    new TokensController(this.conversation.metaParticipantsHandler, this.view.querySelector("[data-ica-jointsource-meta='participants']")).componentOf = this;
    new TokensController(this.conversation.metaThemesHandler, this.view.querySelector("[data-ica-jointsource-meta='themes']")).componentOf = this;

    // Quill

    this.quillIntro = new Quill(this.view.querySelector("[data-ica-jointsource-meta='intro']"), {
      readOnly: true
    });

    this.quillOthers = new Quill(this.view.querySelector("[data-ica-jointsource-meta='others']"), {
      readOnly: true
    });

  });

  MapConversationController.defineMethod("updateView", function updateView() {
    if (!this.view) return;

    // Set display style for metadata
    this.view.querySelectorAll("[data-ica-jointsource-meta-predicate]").forEach(function (element) {
      let metaPredicate = getElementProperty(element, "jointsource-meta-predicate");
      element.style.display = isEmpty(this.conversation.meta[metaPredicate]) ? "none" : "";
    }.bind(this));

    this.view.querySelectorAll("[data-ica-jointsource-meta]").forEach(function (element) {
      let content = this.conversation.meta[getElementProperty(element, "jointsource-meta")];

      switch (getElementProperty(element, "jointsource-meta")) {
        case "intro": this.quillIntro.setText(content || ""); break;
        case "others": this.quillOthers.setText(content || ""); break;
        default: element.textContent = content;
      }
    }.bind(this));

    this.view.querySelector(".jointsource-backdrop").hidden = true;
    let imageSources = this.conversation.imageSources;
    if (imageSources.length > 0) {
      let imageSource = imageSources[0];

      if (imageSource.content) {
        this.view.querySelector(".jointsource-backdrop").hidden = false;

        let backdropImageElement = this.view.querySelector(".jointsource-backdrop-image");
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
    }.bind(this.view));

  });

  MapConversationController.defineMethod("uninitView", function uninitView() {
    if (!this.view) return;

    this.view.removeEventListener("click", viewOnClick);

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

  function editJointSourceAnchorOnClick(event) {
    event.preventDefault();

    this.controller.displayPublisherConversationView();
  }

}(MapConversationController));


var ArticleJointSourceController = JointSourceController.createComponent("ArticleJointSourceController");

ArticleJointSourceController.createViewFragment = function () {
  return cloneTemplate("#template-article");
};

// View

ArticleJointSourceController.defineMethod("initView", function initView() {
  if (!this.view) return;

  this.view.querySelector("[data-ica-action='edit-jointsource']").addEventListener("click", function (e) {
    e.preventDefault();
    var fragment = PublisherJointSourceController.createViewFragment();
    var element = fragment.querySelector(".publisher");
    document.body.appendChild(fragment);
    new PublisherJointSourceController(this.controller.jointSource, element);
  }.bind(this.view));

  this.view.querySelector("[data-ica-action='close']").addEventListener("click", function (e) {
    e.preventDefault();
    var jointSource = this.controller.jointSource;
    var mapController = this.controller.componentOf;
    this.controller.destroy(true);
    mapController.map.removeArticle(jointSource);
  }.bind(this.view));

  this.view.querySelector("[data-ica-action='previous-source']").addEventListener("click", function (e) {
    e.preventDefault();
    var sourcesElement = this.querySelector(".sources");
    var destIndex = Math.max(0, Math.round(sourcesElement.scrollLeft / sourcesElement.offsetWidth) - 1);
    var destScrollLeft = sourcesElement.offsetWidth * destIndex;
    sourcesElement.scrollLeft = destScrollLeft;
  }.bind(this.view));

  this.view.querySelector("[data-ica-action='next-source']").addEventListener("click", function (e) {
    e.preventDefault();
    var sourcesElement = this.querySelector(".sources");
    var destIndex = Math.min(sourcesElement.children.length, Math.round(sourcesElement.scrollLeft / sourcesElement.offsetWidth) + 1);
    var destScrollLeft = sourcesElement.offsetWidth * destIndex;
    sourcesElement.scrollLeft = destScrollLeft;
  }.bind(this.view));

  // Resize height of sources box

  var resizeSourcesHeight = function resizeSourcesHeight() {
    var sourceIndex = Math.round(this.scrollLeft / this.offsetWidth);
    if (this.children[sourceIndex]) {
      this.style.height = this.children[sourceIndex].offsetHeight + "px";
    }
    this.parentNode.querySelector("[data-ica-jointsource-source-index]").textContent = sourceIndex + 1;
    this.parentNode.querySelector("[data-ica-action='previous-source']").style.opacity = sourceIndex > 0 ? 1 : 0;
    this.parentNode.querySelector("[data-ica-action='next-source']").style.opacity = sourceIndex < this.children.length - 1 ? 1 : 0;
  }.bind(this.view.querySelector(".sources"));

  this.view.querySelector(".sources").addEventListener("scroll", resizeSourcesHeight);

  this.resizeSourcesHeightRoutine = new Routine(resizeSourcesHeight, 400);
  this.resizeSourcesHeightRoutine.componentOf = this;

  new TokensController(this.jointSource.metaParticipantsHandler, this.view.querySelector("[data-ica-jointsource-meta='participants']")).componentOf = this;
  new TokensController(this.jointSource.metaThemesHandler, this.view.querySelector("[data-ica-jointsource-meta='themes']")).componentOf = this;
});

ArticleJointSourceController.defineMethod("updateView", function updateView() {
  if (!this.view) return;

  this.view.querySelectorAll("[data-ica-jointsource-meta-predicate]").forEach(function (element) {
    var metaPredicate = getElementProperty(element, "jointsource-meta-predicate");
    if (empty(this.jointSource.meta[metaPredicate])) {
      element.style.display = "none";
    } else {
      element.style.display = "";
    }
  }.bind(this));

  this.view.querySelectorAll("[data-ica-jointsource-meta]").forEach(function (element) {
    element.textContent = this.jointSource.meta[getElementProperty(element, "jointsource-meta")];
  }.bind(this));

  this.jointSource.forEachSource(function (source) {
    if (this.controller.view.querySelector("[data-ica-source-id='{0}']".format(source.sourceId))) return;

    var fragment, element;
    switch (source.constructor) {
    case ImageSource:
      fragment = ArticleImageSourceController.createViewFragment();
      element = fragment.querySelector(".source");
      this.querySelector(".sources").appendChild(fragment);
      new ArticleImageSourceController(source, element).componentOf = this.controller;
      break;
    case AudioSource:
      fragment = ArticleAudioSourceController.createViewFragment();
      element = fragment.querySelector(".source");
      this.querySelector(".sources").appendChild(fragment);
      new ArticleAudioSourceController(source, element).componentOf = this.controller;
      break;
    case VideoSource:
      fragment = ArticleVideoSourceController.createViewFragment();
      element = fragment.querySelector(".source");
      this.querySelector(".sources").appendChild(fragment);
      new ArticleVideoSourceController(source, element).componentOf = this.controller;
      break;
    case HyperlinkSource:
      fragment = ArticleHyperlinkSourceController.createViewFragment();
      element = fragment.querySelector(".source");
      this.querySelector(".sources").appendChild(fragment);
      new ArticleHyperlinkSourceController(source, element).componentOf = this.controller;
      break;
    case TextSource:
    default:
      fragment = ArticleTextSourceController.createViewFragment();
      element = fragment.querySelector(".source");
      this.querySelector(".sources").appendChild(fragment);
      new ArticleTextSourceController(source, element).componentOf = this.controller;
    }
  }.bind(this.view));

  this.resizeSourcesHeightRoutine.restart();
  this.view.querySelector("[data-ica-jointsource-number-of-sources]").textContent = this.jointSource.getNumberOfSources();
});

ArticleJointSourceController.defineMethod("uninitView", function uninitView() {

  if (this.resizeSourcesHeightRoutine) {
    this.resizeSourcesHeightRoutine.destroy();
    delete this.resizeSourcesHeightRoutine;
  }

});

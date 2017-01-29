
var ArticleJointSourceController = JointSourceController.createComponent("ArticleJointSourceController");

ArticleJointSourceController.createViewFragment = function () {
  return cloneTemplate("#template-article");
}

// View

ArticleJointSourceController.defineMethod("initView", function initView() {
  if (!this.view) return;

  this.view.querySelector("[data-ica-action='edit-jointsource']").addEventListener("click", function (e) {
    e.preventDefault();
    e.stopPropagation();
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
    mapController.map.didUpdate();
  }.bind(this.view));

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

    switch (source.constructor) {
      case ImageSource:
        var fragment = ArticleImageSourceController.createViewFragment();
        var element = fragment.querySelector(".source");
        this.querySelector(".sources").appendChild(fragment);
        new ArticleImageSourceController(source, element).componentOf = this.controller;
        break;
      case AudioSource:
        var fragment = ArticleAudioSourceController.createViewFragment();
        var element = fragment.querySelector(".source");
        this.querySelector(".sources").appendChild(fragment);
        new ArticleAudioSourceController(source, element).componentOf = this.controller;
        break;
      case TextSource:
      default:
        var fragment = ArticleTextSourceController.createViewFragment();
        var element = fragment.querySelector(".source");
        this.querySelector(".sources").appendChild(fragment);
        new ArticleTextSourceController(source, element).componentOf = this.controller;
    }
  }.bind(this.view));
});

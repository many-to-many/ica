
var ExploreJointSourceController = JointSourceController.createComponent("ExploreJointSourceController");

ExploreJointSourceController.createViewFragment = function () {
  return cloneTemplate("#template-explore-jointsource");
};

ExploreJointSourceController.defineAlias("model", "jointSource");

ExploreJointSourceController.defineMethod("initView", function initView() {
  if (!this.view) return;

  setElementProperty(this.view, "jointsource-id", this.jointSource.jointSourceId);

  this.view.querySelector("[data-ica-action='edit-jointsource']").addEventListener("click", function (e) {
    e.preventDefault();
    var fragment = PublisherJointSourceController.createViewFragment();
    var element = fragment.querySelector(".publisher");
    document.body.appendChild(fragment);
    var publisherController = new PublisherJointSourceController(this.controller.jointSource, element);
  }.bind(this.view));

  new TokensController(this.jointSource.metaParticipantsHandler, this.view.querySelector("[data-ica-jointsource-meta='participants']")).componentOf = this;
  new TokensController(this.jointSource.metaThemesHandler, this.view.querySelector("[data-ica-jointsource-meta='themes']")).componentOf = this;
});

ExploreJointSourceController.defineMethod("updateView", function updateView() {
  if (!this.view) return;

  this.view.querySelectorAll("[data-ica-jointsource-meta-predicate]").forEach(function (element) {
    var metaPredicate = getElementProperty(element, "jointsource-meta-predicate");
    if (this.jointSource.meta[metaPredicate]) {
      element.style.display = "";
    } else {
      element.style.display = "none";
    }
  }.bind(this));

  this.view.querySelectorAll("[data-ica-jointsource-meta]").forEach(function (element) {
    element.textContent = this.jointSource.meta[getElementProperty(element, "jointsource-meta")];
  }.bind(this));

  this.jointSource.forEachSource(function (source) {
    // Check existing element
    if (this.querySelector("[data-ica-source-id='{0}']".format(source.sourceId))) return;

    // Create new view
    switch (source.constructor) {

      case AudioSource:

        var fragment = ExploreAudioSourceController.createViewFragment();
        var element = fragment.querySelector(".source");
        this.querySelector(".sources").appendChild(fragment);
        new ExploreAudioSourceController(source, element).componentOf = this.controller;

        break;

      case TextSource:
      default:

        var fragment = ExploreTextSourceController.createViewFragment();
        var element = fragment.querySelector(".source");
        this.querySelector(".sources").appendChild(fragment);
        new ExploreTextSourceController(source, element).componentOf = this.controller;

    }
  }.bind(this.view));
});

ExploreJointSourceController.defineMethod("uninitView", function uninitView() {
  if (!this.view) return;

  removeElementProperty(this.view, "jointsource-id");
});

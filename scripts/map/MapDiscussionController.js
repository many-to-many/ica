
const MapDiscussionController = DiscussionController.createComponent("MapDiscussionController");

MapDiscussionController.createViewFragment = function () {
  return cloneTemplate("#template-map-discussion");
};

// View

MapDiscussionController.defineMethod("initView", function initView() {
  if (!this.view) return;

  this.view.addEventListener("click", function (e) {
    e.preventDefault();
    e.stopPropagation();
  }.bind(this.view));

});

MapDiscussionController.defineMethod("updateView", function updateView() {
  if (!this.view) return;

  this.view.querySelectorAll("[data-ica-discussion-predicate]").forEach(function (element) {
    let predicate = getElementProperty(element, "discussion-predicate");
    if (ICA.empty(this.discussion[predicate])) {
      element.style.display = "none";
    } else {
      element.style.display = "";
    }
  }.bind(this));

  this.view.querySelectorAll("[data-ica-discussion]").forEach(function (element) {
    element.textContent = this.discussion[getElementProperty(element, "discussion")]["0"];
  }.bind(this));

});

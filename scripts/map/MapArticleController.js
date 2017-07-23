
var MapArticleController = SingleModelController.createComponent("MapArticleController");

MapArticleController.defineMethod("construct", function construct() {
  this.jointSourceController = undefined;
  Object.defineProperty(this, "jointSource", {
    get: function () {
      return this.jointSourceController.jointSource;
    }
  });
});

// View

MapArticleController.defineMethod("initView", function initView() {
  if (!this.view) return;

  let routerIndex = Router.index - 1; // A new state's already inserted in successor controllers

  this.view.addEventListener("click", function () {
    Router.jump(routerIndex);
  });
});

MapArticleController.defineMethod("unhideView", function unhideView() {
  if (!this.view) return;

  let view = getElementProperty(this.view, "view");

  for (let element of this.view.parentNode.querySelectorAll("[data-ica-view]")) {
    element.hidden = element !== this.view;
  }

  for (let element of document.body.querySelectorAll("[data-ica-for-view]")) {
    let forView = getElementProperty(element, "for-view");
    element.classList.toggle("active", view === forView);
  }
});

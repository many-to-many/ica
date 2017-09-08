
/**
 * MapArticleController
 * Abstract view controller to display a jointSource.
 * @constructor
 */
let MapArticleController = SingleModelController.createComponent("MapArticleController");

MapArticleController.defineMethod("construct", function construct() {

  this.jointSourceController = null;

  Object.defineProperty(this, "jointSource", {
    get: function () {
      return this.jointSourceController.jointSource;
    }
  });

});

// View

(function (MapArticleController) {

  MapArticleController.defineMethod("initView", function initView() {
    if (!this.view) return;

    // Record the router index of before the article is showed
    this.routerIndex = Router.index - 1; // A new state's already inserted in a successor controllers' initView()

    // Click event
    this.view.addEventListener("click", viewOnClick);

  });

  MapArticleController.defineMethod("uninitView", function uninitView() {
    if (!this.view) return;

    // Click event
    this.view.removeEventListener("click", viewOnClick);

    // Remove the router index
    delete this.routerIndex;

  });

  // Shared functions

  function viewOnClick() {
    Router.jump(this.controller.routerIndex);
  }

})(MapArticleController);

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


var AppController = Controller.createComponent("AppController");

AppController.defineMethod("initView", function () {
  if (!this.view) return;

  this.explore = new Explore();
  new ExploreController(
    this.explore,
    this.view.querySelector(".explore")
  ).componentOf = this;

  ICA.getJointSources()
    .then(function (jointSources) {
      this.explore.addItems(jointSources);
      this.explore.didUpdate();
    }.bind(this));
});

/*****/

var appController;

window.addEventListener("load", function () {
  window.addEventListener("resize", resize);

  appController = new AppController(document.body);

  document.querySelector("[href='#search']").click();
});
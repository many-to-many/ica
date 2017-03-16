
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
    }.bind(this))
    .catch(function (err) {
      console.warn(err);
    });

  this.searchExplore = new Explore();
  new ExploreController(
    this.searchExplore,
    this.view.querySelector(".search .explore")
  ).componentOf = this;

  this.view.querySelectorAll(".search .search-control [data-ica-jointsource-query-meta]").forEach(function (element) {
    element.addEventListener("input", function (e) {
      ICA.getJointSources({
        q: this.querySelector(".search .search-control [data-ica-jointsource-query-meta='title']").value
      })
         .then(function (jointSources) {
           this.controller.searchExplore.putItems(jointSources);
           this.controller.searchExplore.didUpdate();
         }.bind(this))
         .catch(function (err) {
           console.warn(err);
         });
    }.bind(this));
  }.bind(this.view));
});

/*****/

window.addEventListener("load", function () {
  window.addEventListener("resize", resize);

  appController = new AppController(document.body);

  document.querySelector("[href='#explore']").click();
});

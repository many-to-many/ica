
var Map = JointModel.createComponent("Map");

Map.defineMethod("init", function init(articles) {
  // Init articles
  this.articles = [];
  for (var article of articles) {
    this.addArticle(article);
  }
  return [];
});

Map.defineMethod("uninit", function uninit() {
  // Uninit articles
  delete this.articles;
});

Map.defineMethod("retainModel", function retainModel(article) {
  this.articles.push(article);
});

Map.defineMethod("releaseModel", function releaseModel(article) {
  var index = this.articles.indexOf(article);
  if (index > -1) {
    // Remove article and every one after the item too
    this.articles.splice(index, 1);
    var removed = this.articles.splice(index, this.articles.length - index - 1);
    for (let article of removed) {
      this.removeArticle(article);
    }
    this.didUpdate();
  }
});

Map.prototype.addArticle = function addArticle(article) {
  this.retainModel(article);
};

Map.prototype.removeArticle = function removeArticle(article) {
  this.releaseModel(article);
};

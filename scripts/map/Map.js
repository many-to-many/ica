
var Map = Model.createComponent("Map");

Map.defineMethod("init", function init(articles) {
  // Init articles
  this.articles = articles || [];
  return [];
});

Map.defineMethod("uninit", function uninit() {
  // Uninit articles
  delete this.articles;
});

Map.prototype.addArticle = function addArticle(article) {
  this.articles.push(article);
};

Map.prototype.removeArticle = function removeArticle(article) {
  var index = this.articles.indexOf(article);
  if (index > -1) {
    // Remove article and every one after the item too
    this.articles.splice(index, this.articles.length - index);
  }
};

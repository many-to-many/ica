
let JointSourcesHandler = Handler.createComponent("JointSourcesHandler");

JointSourcesHandler.defineAlias("content", "jointSources");

JointSourcesHandler.defineMethod("init", function init(content = []) {
  return [content];
});

JointSourcesHandler.defineMethod("add", function (jointSource) {
  if (this.jointSources.indexOf(jointSource) < 0) {
    this.jointSources.push(jointSource);
  }
});

JointSourcesHandler.defineMethod("remove", function (jointSource) {
  let index = this.jointSources.indexOf(jointSource);
  if (index > -1) {
    this.jointSources.splice(index, 1);
  }
});

JointSourcesHandler.defineMethod("toggle", function (jointSource) {
  let index = this.jointSources.indexOf(jointSource);
  if (index > -1) {
    this.jointSources.splice(index, 1);
    return false;
  }
  this.jointSources.push(jointSource);
  return true;
});

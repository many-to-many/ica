
var PublisherTextSourceController = PublisherSourceController.createComponent("PublisherTextSourceController");

PublisherTextSourceController.createViewFragment = function () {
  return cloneTemplate("#template-publisher-textsource");
};

PublisherTextSourceController.defineMethod("initView", function initView() {
  if (!this.view) return;

  var editor = this.view.querySelector("[data-ica-source-content]");
  this.quill = new Quill(editor, {
    modules: {
      toolbar: false
    },
    theme: "",
    placeholder: "Enter text here..."
  });
  this.quill.on("text-change", function (delta, oldDelta, source) {
    if (source == "user") {
      this.source.content = this.quill.getText().replace(/\s*\n$/, "");
    }
  }.bind(this));
});

PublisherTextSourceController.defineMethod("updateView", function updateView() {
  if (!this.view) return;

  this.quill.setText(this.source.content);
});

PublisherTextSourceController.defineMethod("uninitView", function uninitView() {
  if (!this.view) return;

  delete this.quill;
});

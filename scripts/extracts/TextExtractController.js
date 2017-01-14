
var TextExtractController = function (view, extract) {
  if (!(extract instanceof TextExtract)) throw "extract must be a class TextExtract instance";
  this.extract = extract;
  Controller.call(this, view);

  // console.log("New TextExtractController:", this);
}

TextExtractController.prototype = Object.create(Controller.prototype);

TextExtractController.prototype.constructor = TextExtractController;

// TextExtractController.prototype._viewDidUpdate = function () {
//   this.extract.controllerCount = 0;
//   this.view.addEventListener("mouseenter", function () {
//     this.extract.controllerCount++;
//     var spans = document.body.querySelectorAll("[data-ica-textsource='{0}'] [data-ica-textsource-extract~='{1}']".format(this.extract.source.id, this.extract.id));
//     for (var span of spans.values()) {
//       console.log(span);
//       span.style.borderColor = "hsl(230, 100%, 70%)";
//     }
//   }.bind(this));
//   this.view.addEventListener("mouseleave", function () {
//     this.extract.controllerCount--;
//     if (this.extract.controllerCount == 0) {
//       var spans = document.body.querySelectorAll("[data-ica-textsource='{0}'] [data-ica-textsource-extract~='{1}']".format(this.extract.source.id, this.extract.id));
//       for (var span of spans.values()) {
//         span.style.borderColor = "";
//       }
//     }
//   }.bind(this));
// };

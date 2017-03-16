
var ArticleTextSourceController = ArticleSourceController.createComponent("ArticleTextSourceController");

ArticleTextSourceController.createViewFragment = function (source) {
  return cloneTemplate("#template-article-textsource");
};

ArticleTextSourceController.defineMethod("updateView", function updateView(length = 0) {
  if (!this.view) return;

  // Reset view
  var parentNode = this.view.parentNode;
  var sourceFragment = ArticleTextSourceController.createViewFragment();
  var sourceElement = sourceFragment.querySelector(".source");
  parentNode.replaceChild(sourceFragment, this.view);
  this.uninitView();
  this._view = sourceElement;
  this.initView(false);

  // Select some content
  var content = this.source.content;
  if (length) content = content.substring(0, length);

  setElementProperty(this.view, "textsource-id", this.source.sourceId);
  setElementProperty(this.view, "textsource-start", 0);
  setElementProperty(this.view, "textsource-length", content.length);
  var sourceParagraphs = content.split("\n");
  var sourceLength = 0;
  for (var sourceParagraphIndex in sourceParagraphs) {
    var sourceParagraph = sourceParagraphs[sourceParagraphIndex];
    var sourceParagraphElement = document.createElement("p");

    var textSourceParagraph = sourceParagraphIndex;
    var textSourceStart = sourceLength;
    var textSourceLength = sourceParagraph.length;
    var textSourceEnd = textSourceStart + textSourceLength;
    setElementProperty(sourceParagraphElement, "textsource-paragraph", textSourceParagraph);
    setElementProperty(sourceParagraphElement, "textsource-start", textSourceStart);
    setElementProperty(sourceParagraphElement, "textsource-length", textSourceLength);

    // Apply extract
    var textInserts = [];
    textInsert = function (absoluteIndex, description = {}) {
      if (!(absoluteIndex in textInserts)) textInserts[absoluteIndex] = [];
      textInserts[absoluteIndex].push(description);
    };

    this.source.forEachExtract(function (extract) {
      var extractSchemeStart = extract.scheme.start;
      var extractSchemeEnd = extract.scheme.start + extract.scheme.length;
      if (extractSchemeEnd < textSourceStart || extractSchemeStart > textSourceEnd) return;
      if (extractSchemeStart >= textSourceStart) {
        if (extractSchemeEnd <= textSourceEnd) {
          // Extract subset of the whole
          // console.log("[]");
          textInsert(extractSchemeStart, {
            mark: "in",
            extract: extract
          });
          textInsert(extractSchemeEnd, {
            mark: "out",
            extract: extract
          });
        } else {
          // Extract begins in paragraph but goes beyond
          // console.log("[-");
          textInsert(extractSchemeStart, {
            mark: "in",
            extract: extract
          });
          textInsert(textSourceEnd, {
            mark: "out",
            extract: extract
          });
        }
      } else {
        if (extractSchemeEnd <= textSourceEnd) {
          // Extract begins before paragraph starts and ends in the paragraph
          // console.log("-]");
          textInsert(textSourceStart, {
            mark: "in",
            extract: extract
          });
          textInsert(extractSchemeEnd, {
            mark: "out",
            extract: extract
          });
        } else {
          // Extract covers the whole of the paragraph
          // console.log("--");
          textInsert(textSourceStart, {
            mark: "in",
            extract: extract
          });
          textInsert(textSourceEnd, {
            mark: "out",
            extract: extract
          });
        }
      }
    });

    function createSpan(textInsert) {
      var span = document.createElement("span");
      textInsert.map(function (description) {
        switch (description.mark) {
        case "in":
          // console.log("mark in", description.extract.id)
          extracts[description.extract.id] = description.extract;
          break;
        case "out":
          // console.log("mark out", description.extract.id)
          delete extracts[description.extract.id];
          break;
        }
      });
      var extractIds = [];
      extracts.map(function (extract) {
        new TextExtractController(span, extract);
        extractIds.push(extract.id);
      });
      setElementProperty(span, "textsource-extract", extractIds.join(" "));
      return span;
    }
    var previousAbsoluteIndex = textSourceStart, previousRelativeIndex = 0;
    var extracts = [], span = createSpan([]);
    for (var absoluteIndex in textInserts) {
      var relativeIndex = absoluteIndex - textSourceStart;
      let length = absoluteIndex - previousAbsoluteIndex;

      if (length > 0) {
        setElementProperty(span, "textsource-start", previousAbsoluteIndex);
        setElementProperty(span, "textsource-length", length);
        span.textContent = sourceParagraph.substring(previousRelativeIndex, relativeIndex);
        sourceParagraphElement.appendChild(span);
      }

      span = createSpan(textInserts[absoluteIndex]);

      previousAbsoluteIndex = absoluteIndex;
      previousRelativeIndex = relativeIndex;
    }
    if (textSourceEnd - previousAbsoluteIndex > 0) {
      setElementProperty(span, "textsource-start", previousAbsoluteIndex);
      setElementProperty(span, "textsource-length", textSourceEnd - previousAbsoluteIndex);
      span.textContent = sourceParagraph.substring(previousRelativeIndex, textSourceLength);
      sourceParagraphElement.appendChild(span);
    }

    // Add paragraph
    // sourceParagraphElement.textContent = sourceParagraph;
    sourceLength += sourceParagraph.length + 1; // Count in `\n`
    this.view.appendChild(sourceParagraphElement);
  }
  if (sourceLength - 1 != content.length) {
    console.log(sourceLength, content.length);
    throw "error testing text source length";
  }
});

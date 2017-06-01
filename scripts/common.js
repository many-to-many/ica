
// Code from: http://adripofjavascript.com/blog/drips/object-equality-in-javascript.html

function equals(a, b) {
  // Create arrays of property names
  var aProps = Object.getOwnPropertyNames(a);
  var bProps = Object.getOwnPropertyNames(b);

  // If number of properties is different,
  // objects are not equivalent
  if (aProps.length != bProps.length) {
    return false;
  }

  for (var i = 0; i < aProps.length; i++) {
    var propName = aProps[i];

    // If values of same property are not equal,
    // objects are not equivalent
    if (a[propName] !== b[propName]) {
      return false;
    }
  }

  // If we made it this far, objects
  // are considered equivalent
  return true;
}

// Code from: https://stackoverflow.com/questions/4793604/how-to-do-insert-after-in-javascript-without-using-a-library

function insertAfter(newElement, targetElement) {
  // Target is what you want it to go after. Look for this elements parent
  var parent = targetElement.parentNode;

  // If the parents lastchild is the targetElement
  if (parent.lastChild == targetElement) {
    // Add the newElement after the target element
    parent.appendChild(newElement);
  } else {
    // Else the target has siblings, insert the new element between the target and it's next sibling
    parent.insertBefore(newElement, targetElement.nextSibling);
  }
}

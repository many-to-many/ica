
# Component

A syntactical sugar for the JavaScript class.

Whenever creating a subclass, the constructor of the superclass is usually called for initialization. Manually keeping track of subclasses from some class or the superclass takes time for coding and maintenance. With a shared class `Component`, the inheritance in JavaScript may be simplified slightly from avoiding applying the superclass method on `this` every time a method is overridden and extended.

## `Component`

### Life Cycle

With `new Component()`, a `Component` instance follows the process listed below: (Note the symmetry in the methods.)

- `create()` - A pseudo-function constructor that is called every time an object is constructed, e.g. `new Component()`.

  It calls `construct()`, and `init()` with the arguments passed into the constructor (the arguments passed into `new Component()`).

  - `construct()` *(avoid calling)* - A generic method that initializes the instance, independent of the arguments.

    For example, in `construct()`, a reference to the object is saved in `Component.components`. It is useful in `construct()` to create instance variables that are hard to be taken from the prototype, like objects including `Array`.

  - `init()` *(avoid calling)* - A method that initializes the instance, applied with the arguments passed into `new Component()`. The body of the function is usually object-specific.

- `destroy()` - A method to be called on a `Component` instance when it is no longer in use and ready for freeing. Calling `destroy()` on an `Component` instance will destroy its sub-components at the same time.

  It calls `uninit()` and `destruct()`.

  - `uninit()` *(avoid calling)* - A method that undos the effect from `init()`, uninitializing the instance members specific to the arguments.

  - `destruct()` *(avoid calling)* - A method that undos the effect from `construct()`.

### Instance's Parent Component

To set a parent component of some component, use the following script:

```JavaScript
// To set parent component
// This also causes `parentComponent.components` to include someComponent
someComponent.componentOf = parentComponent;
```

In this case, `someComponent.destroy()` will be called when `parentComponent.destroy()`.

```JavaScript
// To reset
someComponent.componentOf = null;
```

`Component` is designed in the way that each `Component` instance has a dictionary that other `Component` instances may hook onto. By setting `componentOf`, the parent component at the same time retains a reference to the child component so that, (1) when parent component is destroyed, its child components will be destroyed together, and (2) when the child component is destroyed, the parent will release its reference. This design is also known to be used in `Model` (described later in this article).

### Extending and Using a `Component`

To extend a component class, use the following script:

```JavaScript
// Extend from a component
var /* component class */ House =
  Component.createComponent(/* component name */ "House");

// A few more example classes
var Door = Component.createComponent("Door");
var WoodenDoor = Door.createComponent("Wooden Door"); // Whitespaces are allowed as a component name
var Knob = Component.createComponent("Door Knob");

// Creating instances
var house = new House();
var door = new WoodenDoor();
var knob = new Knob();

// Setting sub-components
door.componentOf = house; // Instance door is a component of the house
knob.componentOf = door; // Instance knob is a component of the door

// Destroy the house
// This destroys the instance knob and door
house.destroy();
house = null; // House instance already destroyed
// No need to call door.destroy() or knob.destroy()
door = null; // Door instance destroyed while House instance destroyed
knob = null; // Knob instance destroyed while House instance destroyed
```

### Defining Methods with Less Hassle

To define a method, which may be extended from `Component.init()`, refer to the script below:

```JavaScript
// Animal class

var Animal = Component.createComponent("Animal");

Animal.defineMethod("init", function init(name) {
  this.name = name;
  // The return value of `Animal.init()` is the list of arguments to be called on `Component.init()`, this functioning like a proxy.
  return [];
});

// End of Animal class
// Cat class

// Any changes of methods in Animal class introduced after the next line will not be effective to the Cat class.
var Cat = Animal.createComponent("Cat");

// Define a new method named `makeNoise`
Cat.defineMethod("makeNoise", function makeNoise(words) {
  return this.name + " meows: " + words;
});

// End of Cat class
// Tiger class

var Tiger = Cat.createComponent("Tiger");

// Define a same method named makeNoise
// NB: This is not overriding `Cat.makeNoise()`
Tiger.defineMethod("makeNoise", function makeNoise(words) {
  // The return value of `makeNoise` is the list of arguments to be called on the `makeNoise` method of the superclass, this functioning like a proxy.
  return [words + "!!!!!"];
});

// End of Tiger class
// Test
var cat = new Cat("Kitty");
var tiger = new Tiger("Tigris");

cat.makeNoise("arh");
// Return: Kitty meows: arh
tiger.makeNoise("arh");
// Return: Tigris meows: arh!!!!!
```

### Aliases to Class Members

This feature allows creating abstraction barriers on extended components. To create an alias on a class prototype, refer to the following script. Note that the aliases only are only effective on the instances.

```JavaScript
var ColorHolder = Component.createComponent("Color Holder");

ColorHolder.defineMethod("init", function (color) {
  this.color = color;
  return [];
});

// Allow accessing member `color` with `colour` on the instance
ColorHolder.defineAlias("color", "colour");

var holder = new ColorHolder("red");
holder.color == "red";  // True
holder.colour == "red"; // True

// Set color member to blue with alias
holder.colour = "blue";

holder.color == "blue";  // True
holder.colour == "blue"; // True
```

## MVC with `Component`

### `Model`

#### `Handler`

- `ElementHandler`

### `Controller`

#### `SingleModelController`

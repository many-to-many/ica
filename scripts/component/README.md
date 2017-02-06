
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

`Component` is designed in the way that each `Component` instance has a dictionary that other `Component` instances may hook onto. By setting `componentOf`, the parent component at the same time retains a reference to the child component so that, (1) when parent component is destroyed, its child components will be destroyed together, and (2) when a child component is destroyed, it will release its reference from and to the parent. Similar designs are also known to be used in `Model` and `Controller` (described later in this article).

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

With `Component`, `Model` and `Controller` are provided for streamlining the rendering of data, view being `Element`, e.g. `HTMLDivElement`, in general.

### `Model`

`Model` creates a uniform interface for the `Controller` where each `Model` instance has a dictionary that other `Controller` instances may hook onto. This functions in a similar way as `componentOf`: If a `Model` instance is destroyed, its `Controller` instances will be either (1) destroyed if `Model` instance is strongly dependent by them (that `Controller` instance cannot live without the `Model` instance), or (2) requested to remove the reference from and to the `Model`.

#### Life Cycle

With `new Model()`, a `Model` instance follows the process listed below: (Inherited from `Component`; note the symmetry in the methods.)

- `create()` *(inherited)*

  - `construct()` *(extending, avoid calling)*

  - `init()` *(inherited, avoid calling)*

- `didUpdate()` - A method manually called by user that broadcasts all its controllers of the update.

  It calls the `modelDidUpdate()` on `Controller` instances, so the views may be updated accordingly without explicitly calling `updateView()` on every `Controller` instances using this model.

- `destroy(destroyViews = false)` *(extending)*

  It either (1) propagates to destroy its dependent `Controller` instances and their views, when `destroyViews = true`, or (2) requests the `Controller` instances to release their references from and to the `Model` instance, by default.

  - `uninit()` *(inherited, avoid calling)*

  - `destruct()` *(extending, avoid calling)*

#### `Handler`

`Handler` is a specific type of `Model` that handles objects or other values in JavaScript that are not an instance of `Model` to be used with `Controller`. A default `content` member is available for boxed data.

Sub-components of `Handler` may include the following:

- `ElementHandler` - A handler for `Element`, where `content` is aliased to `element` for abstraction.

### `Controller`

`Controller` has a dictionary of all of its retaining `Model` instances. This functions in a similar way as `componentOf`: If a `Controller` instance is destroyed, its `Model` instances will be released, so that all the references from and to the `Model` will suspend. After then, a `Model` instance may no longer send messages to `Controller`, e.g. for `contentDidUpdate()`.

#### Life Cycle

With `new Controller()`, a `Controller` instance follows the process listed below: (Inherited from `Component`; note the symmetry in the methods.)

- `create()` *(inherited)*

  - `construct()` *(extending, avoid calling)*

  - `init()` *(extending, avoid calling)*

- `destroy(destroyViews = false)` *(extending)*

  It removes all references from and to the `Model` instances, which previously may send content update requests.

  - `uninit()` *(extending, avoid calling)*

  - `destruct()` *(extending, avoid calling)*

##### Interacting with `Model`

- `retainModel(model)` - A method that creates references from and to a `Model` instance. Note that a `Controller` may watch updates on multiple `Model` instances at a same time. It is useful when a `Model` instance fires `didUpdate()` and that `Controller` will be notified of the event.

  (See `SingleModelController` for ease of maintaining the retaining of `Model` instances.)

- `releaseModel(model)` - A method that removes references from and to a `Model` instance. After then the `Model` instance may no longer broadcast message to this `Controller` instance.

- `releaseAllModels()` - A method that releases all `Controller`-`Model` references.

- `modelDidUpdate([model])` - A method, usually called by `Model` instances, that signals update events. It calls `updateView()` so that the content may be refreshed following the latest content from the model(s).

##### Interacting with View

- `initView()` - A method to init the view `Element`, for adding event listeners, etc.

- `updateView()` - A method to update the view `Element`.

- `uninitView()` - A method symmetrical to `initView()`, for removing event listeners, etc.

  It is slightly unnecessary to implement a full-fledged `uninitView()` if `destroyView()` is called for non-reusable `Element` on the webpage.

- `destroyView()` *(avoid calling)* - A method that removes the view `Element` from its parent node.

The `initView()` and `updateView()` method resembles an animation loop, in which `initView()` is called every time a view is attached to a `Controller` instance and `updateView()` is manually called after some of the models is updated.

#### `SingleModelController`

A special `Controller` frequently used is `SingleModelController` that listens to one `Model` instance at a time. With which the only `Model` instance may be accessed through the member `model`.

```JavaScript
// Number Counter class

var NumberCounter = Model.createComponent("Number Counter");

NumberCounter.prototype.number = 0;

NumberCounter.prototype.increment = function increment() {
  this.number += 1;
}

// End of Number Counter class
// Number Display class

var NumberDisplay = SingleModelController.createComponent("Number Display");

NumberDisplay.defineMethod("initView", function initView() {
  if (!this.view) return; // View may be null

  var span = document.createElement("p");
  span.innerHTML = "Init view";
  this.view.appendChild(span);
});

NumberDisplay.defineMethod("updateView", function updateView() {
  if (!this.view || !this.model) return; // View or model may be null

  var span = document.createElement("p");
  span.innerHTML = "Update view, number now: " + this.model.number;
  this.view.appendChild(span);
});

// End of Number Display class

var counter = new NumberCounter();
var display = new NumberDisplay(/* Model */ counter, /* View */ document.body);
// Output: Init view
//         Update view, number now: 0

counter.increment();
counter.didUpdate(); // Manually calling didUpdate()
// Output: Update view, number now: 1

counter.increment();
counter.increment();
counter.didUpdate(); // Manually calling didUpdate() so that changing the content does not fire the update event twice
// Output: Update view, number now: 3
```

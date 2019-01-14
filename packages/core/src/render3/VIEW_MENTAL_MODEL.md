# Mental Model: View, Host, and ChangeDetectors

This document explains the mental model between Components, their Views, Host Elements and the corresponding ChangeDetectors.

- **Component**:
  A Directive which is attached to a _host element_ and has its own template resulting in a view.
- **View** / **Context**: 
  Is an instance of a template. 
  It is a smallest group of the elements which get created and destroyed together.
  A single template may generate many views at runtime.
  A View is associated with a context which contains the values for binding to the view.
  - **Component View**:
    An instance of a template attached to a component.
    The component instance is the context of the component view.
  - **Embedded View**:
    An instance of a template which is not directly connected to a component.
    In template embedded templates are denoted by `<template>`, `<ng-template>` or `<div *directive>` (`*`) syntax.
    At runtime the embedded template can be instantiated into zero or many views and may be inserted anywhere in the DOM tree.
    (It does not have to be inserted at the point of declaration.)
    At the time of the instantiation a context must be provided to the template to create a view.
  - **Host View**:
    An implicit view created for the top level component which contains the _host element_ allowing component to be attached to it.
    A host view wraps an existing component which is created outside of Angular and allows angular component and directives to attach to it.
- **Change Detectors**:
  A set of statements extracted from the template (bindings, interpolation) which are used for updating the view to reflect the current value of the context associated with the view.

# Host

## What is a _host_ element?

A _host_ is the element to which a _component_ or _directive_ is attached.
At most one _component_ and zero or more _directives_ can share the same _host_ element.

```typescript
// assume `my-component` is existing component and `[dir-a]` and `[dir-b]` are existing directives
@Component({
  template: `<my-component dir-a dir-b>...</my-component>`
})
class MyApp {}
```

In the above example the element `my-component` is a host element, because it has a _component_ and two _directives_ attached to it.
The important thing to understand is that the `my-component` element is owned by `MyApp`, not by `MyComponent`.
Ownership describes who is responsible for creating and destroying the element.
(It is the responsibility of `MyApp` (not `MyComponent`) to create `my-component` element; `MyComponent` simply assumes that existing _host_ element exist and attaches itself to it.)

## Why can't a component create its own host?

Host components exist for several reasons:
- It is the way WebComponents work and Angular's mental model was modeled on WebComponents.
- Host elements allow for composition of a _component_ and _directives_ on a single element.
  If _component_ would be responsible for owning (creating) _host_ element than composition would not be possible. 
- Host element is needed for selectors.
  (Parent component declares a _host_ element and existing components and directives match the host element and attach to it.)
- Host element is the context on which host bindings and host listeners are executed.

## Explicit vs Implicit Host Elements

Given:
```typescript
@Component({
  selector: 'child',
  template: `child`
})
class Child {}

@Component({
  selector: 'parent',
  template: `<child></child>`
})
class Parent {}
```

Notice that the `Parent` component view implicitly creates the `<child>` element regardless if the `Child` has been declared. 
For example `<child>` could be a custom element in which case the browser would render its content instead of Angular.
In most cases the _host_ element for a component is just an element in the parent component's view. 
Therefore in most cases the _host_ element is created implicitly as part of the parent component rendering.

However there comes a point where the parent component has no more parents.
In this case the _host_ element needs to be created explicitly. 

In addition to the _host_ element it is also necessary to create a change detection view for the _host_ element so that any `@HostBinding` and `@HostListeners` can be correctly registered and change detected. 
For this reason Angular needs to create a _host_ view which contains the element, and any associated component and directives.
The _host_ view is attached to the _host_ element, and provides the change detection context for the `@HostBinding` and `@HostListeners`.
It can also provide change detection from the _host_ element attributes to the inputs of the component and or directives.

Summary:
- Implicit _host_ is created as part of parent component's view.
- Explicit _host_ needs to be created manually for the top-most component (which has no parent and is being inserted programmatically).

# Basic Walk Through

To better understand _host_ we are providing several examples of usage. 
These examples assume that following components and directives have been declared.

```typescript
@Component({
  selector: 'my-component',
  template: `MyComponent View`
})
class MyComponent {
  @HostBinding('title')
  title = 'MyDirectiveTitle';
}

@Component({
  selector: 'my-app',
  template: `MyApp View`
})
class MyApp {}

@Directive({})
class MyDirective {}
```

A view is a collection of DOM elements. 
Views can be inserted and manipulated like normal DOM elements.
Views have their associated _change detectors_ which need to be invoked to update the views.
The _change detectors_ tree structure reflects `View` tree structure by default. 
Additional APIs are available to modify the _change detector_ tree ordering.

```typescript
interface View {
  __ng_brand__: 'Angular opaque reference representing a view. DO NOT READ/MANIPULATE!'
}
```
NOTE: The `View` interface is the opaque version of `LView`. 

First lets create a host view and add a component to it programmatically.

```typescript
// We need an existing DOM element
// Component is not responsible for creating its own host element. For this reason we have
// to create the host element manually using standard DOM API.
const myAppHostElement = document.createElement('my-app');

// Wrap the existing DOM element into a Host View.
const myAppHostView: View = createHostView(myAppHostElement);
```
NOTE: 
- Host `View`s are unique in that their `TView` is not shared. 
  This means that this `TView` can be fully dynamic, in that we can easily add components and directives, host bindings, etc to this host view.
- Host `View` has an internal flag which declares that its `TView` is not shared and that it modifiable.
  The modifiability is what allows us to add components, directives and host bindings to the `View` dynamically.
- Host `TView`, which is modifiable, can have a scheduler attached to.

Now let's attach a component to the host view.

``` typescript
// We can now create a component and attach it to the host element.
const myApp: MyApp = createComponent(myAppHostView, MyApp);
```

The resulting code will attach the `MyApp` to the DOM tree. 
This new API allows us to removed the current `renderComponent` API for bootstrapping.
The resulting bootstrap of the vanilla application will thous be:

```html
<html>
  <body>
    <my-application id="myApp"></my-application>
  </body>
  <script src="angular/core.umd.js"></script>
  <script src="my-app.umd.js"></script>
  <script>
    ng.createComponent(MyApp, ng.createHostView(myApp));
  </script>
</html>
```

## Creating Embedded Views

Lets assume that we have a following template
```html
<div>
  component template
  <ng-template #name> Hello {{name}} </ng-template>
</div>
```

At runtime the corresponding DOM looks like ths.
```html
<div>
  component template
  <!-- NG: <ng-template> -->
</div>
```
NOTE: The `<ng-template>` position is recorded with a comment node `<!-- NG: <ng-template> -->`.

We can instantiate the `<ng-template>` and insert it like so.
```typescript
interface MyContext {
  name: string
}

const anchor = ...; // retrieve `<!-- NG: <ng-template> -->`
const embeddedViewFactory: ViewFactory<MyContext> = getViewFactory(anchor);
const myContext = { name: 'World' };
const embeddedView: View = embeddedViewFactory(context);
insertViewAfter(embeddedView, anchor);
```


# Change Detection

An application is a collection of `View`s in a tree.
Each `View` has an associated context and a change detector.
Context is the object which is used as the implicit context when evaluating the expression in the `View` (either as part of bindings or events).
A change detector is what evaluates the bindings and if the binding changes updates the corresponding DOM nodes.
When a `View` is appended as a child of another `View` their change detectors are attached in the same way.
This implies that by default the change detector tree follows the same tree as the 

-------------
NOTES


### Retrieving Views

```typescript
// Useful utilities.
const myAppComponentView: View = getView(myApp);
const myAppComponentHostView: View = getView(getHostElement(myApp));
```

## Creating components and directives

This example shows how components can be instantiated.
It does not attach the component DOM trees or the change detection propagation.
(That is shown in the next example).

``` typescript
// Component is not responsible for creating its own host element. For this reason we have
// to create the host element manually using standard DOM api.
const myAppHostElement = document.createElement('my-app');

// We can now create a component and attach it to the host element.
const myApp: MyApp = createComponent(MyApp, myAppHostElement);
```

In the example below, the same operation can be repeated for the second component as well as the directive. 
Notice there is no rule that the host element name (`<div>`) must match the selector of the component (`<my-component>`).
Selectors are only used when assembling the components automatically from other templates.

```typescript
const myComponentHostElement: DivElement = document.createElement('div');
const myComponentHostView: View = createHostView(myComponentHostElement);
const myComponent: MyComponent = createComponent(myComponentHostView, MyComponent);
const myDirective: MyDirective = createDirective(myComponentHostView, MyDirective);
```

## Change Detector

Each `View` has an associated change detector which when called will update the `View` by executing all of the bindings.
When the `View` is inserted into the DOM tree it's change detector is also inserted at that location.
(While change detector tree usually follows the `View` tree it is not strictly necessary, described later.)
Change detectors form a tree.
When parent change detector executes it will also invoke child change detectors, unless the child change detector is disabled.



-------------------------
NOTES


# Change Detection

Change detection describes the act of dirty checking the components and reflecting its state to the component's view. 
Each view (component's template) has a change detector attached to it which can detect changes in the component and reflect those changes to the DOM.
For convenience the change detectors are attached in a tree which reflects the logical tree of components in the DOM.
The implication is that triggering the change detection on the root component will in turn trigger the change detection on the child components as well.
The following API shows how the change detectors can be attach/detached, change detected and marked dirty.

## `attachChangeDetection` / `detachChangeDetection` / `setChangeDetectionMode`

Change detection is broken down to views.
The change detection on the views can be attached or detached in any order.
Usually the change detection views are implicitly linked in the logical order in which they were declared in the component's template.
This API is only needed if one wishes to rearrange the order or when creating components implicitly.

```typescript
/**
 * Attach the child view to a specific location in the change detection tree.
 * 
 * For all parameters:
 *  - If component, then the view that the component owns.
 *  - If element that the view associated with that Element. (Usually host view).
 * 
 * @param parent Where the change detector should be attached so that it is a child of the parent.
 * @param child The child change detector to attach.
 * @param before Optional location of existing change detector to attach to. If not specified attache as last change detector.
 */
function attachChangeDetection(
    parent:ComponentOrElement, 
    child:ComponentOrElement, 
    before?:ComponentOrElement
  ): void;

/**
 * Detach the view from the change detection tree.
 * 
 * For all parameters:
 *  - If component then the view associated with that component.
 *  - If element that the view associated with that Element. (Usually host view).
 * 
 * NOTE: if you want to remove the change detection only temporarily consider using 
 *       `setChangeDetectionMode(ref, ChangeDetectionMode.Disabled.)`
 * 
 * @param componentOrElement Which change detector to permanently remove.
 */
function detachChangeDetection(componentOrElement:ComponentOrElement): void;

const enum ChangeDetectionMode {
  /**
   * A change detection triggered at parent component view will not cross this boundary.
   * 
   * The component is effectively cut off from the parent change detection events. 
   * Change detection can still occur if called explicitly using `detectChanges` or `markDirty`.
   */
  Disabled = 0,


  /**
   * Propagate parent change detection events to the child view only if the originator 
   * of the change detection explicitly called for it.
   * 
   * This is in contrast to `Auto` mode which triggers automatically by Zone.js.
   */
  Explicit = 1,

  /**
   * Automatically propagate all parent change detection events to the child view.
   * 
   * This is in contrast to `Explicit` mode which is triggered programmatically (not 
   * implicitly by Zone.js).
   */
  Auto = 2,
}

/**
 * Set the condition under which the parent change detection event should propagate to the child change detector.
 * 
 * @param componentOrElement Which change detector to set propagation mode on.
 * @param changeDetectionMode `ChangeDetectionMode` to assign.
 */
function setChangeDetectionMode(
    componentOrElement:ComponentOrElement, 
    changeDetectionMode: ChangeDetectionMode
  ): void;
```


## `detectChanges`

### `assertNoChanges`

## `markDirty`


# NOTES

- Root components? How are they created and tracked?
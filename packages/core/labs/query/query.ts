/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Type} from '@angular/core';
import {assertExperimentalAgreement} from '../disclaimer/labs_disclaimer';
import {ComponentInstance} from '../types/component_instance';


/**
 * Find all matching element in component view.
 *
 * `queryAll`/`query` functions are very similar to `querySelectorAll`/`querySelector` function
 * available on DOM. The main difference is that `queryAll`/`query` functions are constrained to the
 * component view (and its embedded-views) where as `querySelectorAll`/`querySelector` will query
 * the DOM disregarding component boundaries and content projection. So a good way to think of
 * `queryAll`/`query` is that they respect Angular component boundaries and work on logical node
 * tree (rather than the render node tree.)
 *
 * `queryAll`/`query` functions are useful when you need to retrieve some information from the
 * component view. This is done in two parts:
 * 1. First the `selector` is used to retrieve a set of `HTMLElement`s.
 * 2. Optionally a `QueryMap` can be used to retrieve specific data from the `HTMLElement`.
 *
 * The result is that with `queryAll`/`query` one can retrieve many useful things from the component
 * view such as DOM elements, components, directives, listeners, animation-players, etc.
 *
 * The `selector` for the query can be:
 * - `string` starting with `"#"`: Retrieve elements which have been marked in template with `#`
 *   reference.
 * - `Type` such as `MyComponent`/`MyDirective`: Retrieve elements which contain `MyComponent` or
 *   `MyDirective`.
 *
 * Queries cross into embedded-views. As can be seen in this example:
 *
 * ```
 * @Component({
 *   template: `
 *     <div #myRef>text</div>
 *     <ul>
 *       <li #myRef *ngForOf="item in items">{{item}}</li>
 *     </ul>
 *   `
 * })
 * class MyComponent {
 *   items = ['A', 'B'];
 * }
 *
 * expect(queryAll(myComponentInstance, '#myRef')).toEqual([
 *   <div #myRef>text</div>,
 *   <li #myRef>A</li>,
 *   <li #myRef>B</li>
 * ]);
 * ```
 * Notice that the query collected `HTMLElement`s from the embedded views attached to `*ngFor`.
 *
 * @param component Component instance to query
 * @param selector query predicate
 *   - `string`: A reference name to find. (must start with '#')
 *   - `Type<any>`: A component or directive type to select.
 * @param map An optional mapping function used to retrieve additional information from the DOM
 *        element.
 */
export function queryAll(component: ComponentInstance, selector: QuerySelector): HTMLElement[];
export function queryAll<M>(
    component: ComponentInstance, selector: QuerySelector, map: QueryMap<M>): M[];
export function queryAll<M>(
    component: ComponentInstance, selector: QuerySelector,
    map: QueryMap<M>| undefined): HTMLElement[]|M[];
export function queryAll<M>(
    component: ComponentInstance, selector: QuerySelector, map?: QueryMap<M>): HTMLElement[]|M[] {
  assertExperimentalAgreement();
  return [];
}

/**
 * Mapping function used with `query`/`queryAll` to retrieve data attached to `HTMLElement`.
 *
 * When executing queries on component views the `query`/`queryAll` function will return
 * `HTMLElement`. Often times what is of interest is not the `HTMLElement` itself but data which is
 * attached to the `HTMLElement`, such as Component, Directive, etc... In such situations the
 * `QueryMap` function can be used to retrieve the data of interest.
 *
 * Example:
 * ```
 * @Component({
 *   template: `
 *      <child-comp #myRef>
 *      </child-comp>
 *    `
 * })
 * class MyComponent {}
 *
 * @Component({
 *   selector: 'child-comp'
 * })
 * class ChildComponent {}
 * ```
 *
 * One could retrieve `ChildComponent` like so:
 * ```
 * const childComp = query(myComponentInstance, '#myRef', getComponent);
 * expect(childComp instanceof ChildComponent).toBe(true);
 * ```
 *
 * Some example of functions which can be used in `QueryMap`:
 * - `getComponent`: retrieves a component at selected location.
 * - `instanceOf(SomeType)`: retrieves a instance of `SomeType` from the node-injector at
 *    selected location.
 * - `animationPlayer('remove')`: retrieve an animation player if it is in `remove` state.
 */
export type QueryMap<R> = (element: HTMLElement) => R;

export type QuerySelector = string | Type<any>;

/**
 * Find first matching element in component view.
 *
 * Same as `queryAll` but returns the first element (or `null`)
 *
 * @param component Component instance to query.
 * @param selector query predicate.
 *   - `string`: A reference name to find. (must start with '#')
 *   - `Type<any>`: A component or directive type to select.
 * @param map An optional mapping function used to retrieve additional information from the DOM
 *        element.
 */
export function query(component: ComponentInstance, selector: QuerySelector): HTMLElement|null;
export function query<M>(
    component: ComponentInstance, selector: QuerySelector, map: QueryMap<M>): M|null;
export function query<M>(
    component: ComponentInstance, selector: QuerySelector,
    map: QueryMap<M>| undefined): HTMLElement|M|null;
export function query<M>(
    component: ComponentInstance, selector: QuerySelector, map?: QueryMap<M>): M|null {
  assertExperimentalAgreement();
  return null;
}

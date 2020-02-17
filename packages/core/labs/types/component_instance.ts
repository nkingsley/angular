/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */


/**
 * Interface representing a component (`@Component`) instance.
 *
 * This is a marker interface used to denote that the argument expected at this location is an
 * instance of component. (An instance of class which was annotated with `@Component` and
 * instantiated by Angular.)
 *
 * This is an empty interface and as such it will match any object. The purpose of this interface is
 * to better identify inputs which expect component instance as a parameter. Without this interface
 * such inputs would be marked as `any` and would have no documentation attached to them.
 */
export interface ComponentInstance {}

/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {RNode} from './interfaces/renderer';
import {EmbeddedViewFactory, View, ViewContainer} from './interfaces/view';


/**
 *
 */
export function getEmbeddedViewFactory<T extends{}>(node: RNode): EmbeddedViewFactory<T>|null {
  return null;
}

/**
 *
 */
export function getHostView(node: RNode): View<never>|null {
  return null;
}


/**
 *
 */
export function getViewContainer<T extends{} = {}>(node: RNode): ViewContainer {
  return null !;
}


/**
 *
 */
export function viewContainerInsertAfter(
    viewContainer: ViewContainer, view: View, insertAfter: View | null): void {
  return null !;
}

/**
 *
 */
export function viewContainerAppend(viewContainer: ViewContainer, view: View): void {
  return null !;
}

/**
 *
 */
export function viewContainerRemove(viewContainer: ViewContainer, view: View): void {
  return null !;
}

/**
 *
 */
export function viewContainerLength(viewContainer: ViewContainer): number {
  return 0;
}

/**
 *
 */
export function viewContainerGet<T extends{} = {}>(
    viewContainer: ViewContainer, index: number): View<T> {
  return null !;
}

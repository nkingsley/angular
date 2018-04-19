/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
export function stringify(value: any): string {
  if (typeof value == 'function') return value.name || value;
  if (typeof value == 'string') return value;
  if (value == null) return '';
  return '' + value;
}

/** Returns whether the `renderer` is a `ProceduralRenderer3` */
export function isProceduralRenderer(renderer: any): boolean {
  return !!((renderer as any).listen);
}

export function createTextNode(value: any, renderer: any): Text {
  value = stringify(value);
  return isProceduralRenderer(renderer) ? renderer.createText(value) :
                                          renderer.createTextNode(value);
}

export function canInsertNativeNode(parent: any, currentView: any): boolean {
  const parentIsElement = parent.type === 0;

  return parentIsElement &&
      (parent.view !== currentView || parent.data === null /* Regular Element. */);
}

export function appendChild(parent: any, child: any | null, currentView: any): boolean {
  if (child !== null && canInsertNativeNode(parent, currentView)) {
    // We only add element if not in View or not projected.
    const renderer = currentView.renderer;
    isProceduralRenderer(renderer) ? renderer.appendChild(parent.native !as any, child) :
                                     parent.native !.appendChild(child);
    return true;
  }
  return false;
}

/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {assertDefined, assertEqual, throwError} from '../util/assert';

import {getComponentDef, getNgModuleDef} from './definition';
import {TNode} from './interfaces/node';
import {LView} from './interfaces/view';
import {isLContainer, isLView} from './util';


export function assertComponentType(
    actual: any,
    msg: string =
        'Type passed in is not ComponentType, it does not have \'ngComponentDef\' property.') {
  if (!getComponentDef(actual)) {
    throwError(msg);
  }
}

export function assertNgModuleType(
    actual: any,
    msg: string =
        'Type passed in is not NgModuleType, it does not have \'ngModuleDef\' property.') {
  if (!getNgModuleDef(actual)) {
    throwError(msg);
  }
}

export function assertPreviousIsParent(isParent: boolean) {
  assertEqual(isParent, true, 'previousOrParentTNode should be a parent');
}

export function assertHasParent(tNode: TNode) {
  assertDefined(tNode.parent, 'previousOrParentTNode should have a parent');
}

export function assertDataNext(lView: LView, index: number, arr?: any[]) {
  if (arr == null) arr = lView;
  assertEqual(
      arr.length, index, `index ${index} expected to be at the end of arr (length ${arr.length})`);
}

export function assertLContainer(value: any, required = false): void {
  (required || value) && assertEqual(isLContainer(value), true, 'Expecting LContainer');
}

export function assertLView(value: any, required = false): void {
  (required || value) && assertEqual(isLView(value), true, 'Expecting LView');
}

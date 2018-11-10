/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {assertEqual} from './assert';
import {DirectiveDef} from './interfaces/definition';
import {TNodeFlags} from './interfaces/node';
import {HookData, CViewData, LViewData, LViewFlags, TView} from './interfaces/view';



/**
 * If this is the first template pass, any ngOnInit or ngDoCheck hooks will be queued into
 * TView.initHooks during directiveCreate.
 *
 * The directive index and hook type are encoded into one number (1st bit: type, remaining bits:
 * directive index), then saved in the even indices of the initHooks array. The odd indices
 * hold the hook functions themselves.
 *
 * @param index The index of the directive in LViewData
 * @param hooks The static hooks map on the directive def
 * @param tView The current TView
 */
export function queueInitHooks(
    index: number, onInit: (() => void) | null, doCheck: (() => void) | null, tView: TView): void {
  ngDevMode &&
      assertEqual(tView.firstTemplatePass, true, 'Should only be called on first template pass');
  if (onInit) {
    (tView.initHooks || (tView.initHooks = [])).push(index, onInit);
  }

  if (doCheck) {
    (tView.initHooks || (tView.initHooks = [])).push(index, doCheck);
    (tView.checkHooks || (tView.checkHooks = [])).push(index, doCheck);
  }
}

/**
 * Loops through the directives on a node and queues all their hooks except ngOnInit
 * and ngDoCheck, which are queued separately in directiveCreate.
 */
export function queueLifecycleHooks(flags: number, tView: TView): void {
  if (tView.firstTemplatePass) {
    const start = flags >> TNodeFlags.DirectiveStartingIndexShift;
    const count = flags & TNodeFlags.DirectiveCountMask;
    const end = start + count;

    // It's necessary to loop through the directives at elementEnd() (rather than processing in
    // directiveCreate) so we can preserve the current hook order. Content, view, and destroy
    // hooks for projected components and directives must be called *before* their hosts.
    for (let i = start; i < end; i++) {
      const def = tView.data[i] as DirectiveDef<any>;
      queueContentHooks(def, tView, i);
      queueViewHooks(def, tView, i);
      queueDestroyHooks(def, tView, i);
    }
  }
}

/** Queues afterContentInit and afterContentChecked hooks on TView */
function queueContentHooks(def: DirectiveDef<any>, tView: TView, i: number): void {
  if (def.afterContentInit) {
    (tView.contentHooks || (tView.contentHooks = [])).push(i, def.afterContentInit);
  }

  if (def.afterContentChecked) {
    (tView.contentHooks || (tView.contentHooks = [])).push(i, def.afterContentChecked);
    (tView.contentCheckHooks || (tView.contentCheckHooks = [])).push(i, def.afterContentChecked);
  }
}

/** Queues afterViewInit and afterViewChecked hooks on TView */
function queueViewHooks(def: DirectiveDef<any>, tView: TView, i: number): void {
  if (def.afterViewInit) {
    (tView.viewHooks || (tView.viewHooks = [])).push(i, def.afterViewInit);
  }

  if (def.afterViewChecked) {
    (tView.viewHooks || (tView.viewHooks = [])).push(i, def.afterViewChecked);
    (tView.viewCheckHooks || (tView.viewCheckHooks = [])).push(i, def.afterViewChecked);
  }
}

/** Queues onDestroy hooks on TView */
function queueDestroyHooks(def: DirectiveDef<any>, tView: TView, i: number): void {
  if (def.onDestroy != null) {
    (tView.destroyHooks || (tView.destroyHooks = [])).push(i, def.onDestroy);
  }
}

/**
 * Calls onInit and doCheck calls if they haven't already been called.
 *
 * @param currentView The current view
 */
export function executeInitHooks(
    currentView: LViewData, tView: TView, creationMode: boolean): void {
  if (currentView[CViewData.FLAGS] & LViewFlags.RunInit) {
    executeComponentHooks(currentView, tView.initHooks, tView.checkHooks, creationMode);
    currentView[CViewData.FLAGS] &= ~LViewFlags.RunInit;
  }
}

/**
 * Iterates over afterViewInit and afterViewChecked functions and calls them.
 *
 * @param currentView The current view
 */
export function executeComponentHooks(
    data: LViewData, allHooks: HookData | null, checkHooks: HookData | null,
    creationMode: boolean): void {
  const hooksToCall = creationMode ? allHooks : checkHooks;
  if (hooksToCall) {
    callComponentHooks(data, hooksToCall);
  }
}

/**
 * Calls lifecycle hooks with their contexts, skipping init hooks if it's not
 * creation mode.
 *
 * @param viewData The current view
 * @param hookData The array in which the hooks are found
 */
export function callComponentHooks(viewData: LViewData, hookData: HookData): void {
  for (let i = 0; i < hookData.length; i += 2) {
    (hookData[i + 1] as() => void).call(viewData[hookData[i] as number]);
  }
}

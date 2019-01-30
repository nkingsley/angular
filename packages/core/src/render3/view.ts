/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {assertDefined, assertDomNode, assertEqual} from '../util/assert';

import {assertLContainer, assertLView} from './assert';
import {getLContext} from './context_discovery';
import {appendChildViewDynamic, createLContainer, createLView, renderEmbeddedTemplate} from './instructions';
import {ACTIVE_INDEX, LContainer, VIEWS} from './interfaces/container';
import {TNode} from './interfaces/node';
import {RNode} from './interfaces/renderer';
import {DECLARATION_VIEW, EmbeddedViewFactory, HOST, LView, LViewFlags, QUERIES, RENDERER, TVIEW, View, ViewContainer} from './interfaces/view';
import {insertView, nativeInsertBefore} from './node_manipulation';
import {getIsParent, setIsParent, setPreviousOrParentTNode} from './state';
import {getLContainer as readLContainer, getLastRootElementFromView, isLContainer, isLView, readElementValue} from './util';

/**
 * Gets the factory for a view based on a passed DOM node.
 * @param node The DOM node to get the view factory for
 */
export function getEmbeddedViewFactory<T extends{}>(node: RNode): EmbeddedViewFactory<T>|null {
  ngDevMode && assertDomNode(node);
  const lContext = getLContext(node);
  if (lContext) {
    const declarationLView = lContext.lView;
    const declarationTView = declarationLView[TVIEW];
    const declrationTNode = declarationTView.data[lContext.nodeIndex] as TNode;
    const templateTView = declrationTNode.tViews;
    if (templateTView) {
      if (Array.isArray(templateTView)) {
        ngDevMode &&
            assertEqual(Array.isArray(templateTView), false, 'Array of TViews not supported');
      } else {
        return function(context: T): View {
          const _isParent = getIsParent();
          setIsParent(true);
          setPreviousOrParentTNode(null !);

          const lView = createLView(
              declarationLView, templateTView, context, LViewFlags.CheckAlways, null, null);
          lView[DECLARATION_VIEW] = declarationLView;

          if (declarationTView.firstTemplatePass) {
            declarationTView.node !.injectorIndex = declrationTNode.injectorIndex;
          }

          const queries = declarationLView[QUERIES];
          if (queries) {
            lView[QUERIES] = queries.createView();
          }

          renderEmbeddedTemplate(lView, templateTView, context);

          setIsParent(_isParent);
          return lView as any;
        };
      }
    }
  }
  return null;
}

/**
 *
 */
export function getHostView(node: RNode): View<never>|null {
  return null;
}


/**
 * Gets the {@link ViewContainer} for the given DOM node, if there is a view container, otherwise it
 * returns `null`.
 * @param node The DOM node to get the view container for
 */
export function getViewContainer(node: RNode): ViewContainer|null {
  ngDevMode && assertDomNode(node);
  return getViewContainerInternal(node) as ViewContainer | null;
}

function getViewContainerInternal(node: RNode): LContainer|null {
  const lContext = getLContext(node);
  let lContainer: LContainer|null = null;
  if (lContext) {
    const lView = lContext.lView;
    const nodeIndex = lContext.nodeIndex;
    const lViewContainerOrElement: LView|LContainer|RNode = lView[nodeIndex];
    lContainer = readLContainer(lViewContainerOrElement);
    if (!lContainer) {
      const element = readElementValue(lViewContainerOrElement);
      lContainer = lView[nodeIndex] = createLContainer(element, lView, element as any, true);
      appendChildViewDynamic(lView, lContainer);
    }
  }
  return lContainer;
}

/**
 * Inserts a {@link View} in a {@link ViewContainer} after a specified {@link View} reference
 * (`insertAfter`). If `insertAfter` is `null`, then we append the view as the last view in the
 * container.
 * @param viewContainer The container to add insert the `view` in
 * @param view The view to insert in the container
 * @param insertAfter The view reference to insert the `view` after, if `insertAfter` is `null`,
 * `view` is then appended as the last view.
 */
export function viewContainerInsertAfter(
    viewContainer: ViewContainer, view: View, insertAfter: View | null): void {
  ngDevMode && assertLContainer(viewContainer);
  ngDevMode && assertLView(view);
  ngDevMode && assertLView(insertAfter);

  return viewContainerInsertAfterInternal(viewContainer as any, view as any, insertAfter as any);
}

function viewContainerInsertAfterInternal(
    lContainer: LContainer, lView: LView, insertAfterLView: LView | null) {
  const containerNode = readElementValue(lContainer[HOST]);
  const insertAfterNode =
      insertAfterLView ? getLastRootElementFromView(insertAfterLView !) : containerNode;
  const tView = lView[TVIEW];
  let tNode = tView.firstChild;
  ngDevMode && assertDefined(tNode, 'View has no nodes');

  const index =
      insertAfterLView ? getViewIndex(lContainer, insertAfterLView) + 1 : lContainer[ACTIVE_INDEX];
  insertView(lView, lContainer, index);

  const referenceNode = insertAfterNode.nextSibling;
  while (tNode) {
    const node = lView[tNode.index];
    nativeInsertBefore(lView[RENDERER], containerNode.parentElement !, node, referenceNode);
    tNode = tNode.next;
  }
}

function getViewIndex(lContainer: LContainer, lView: LView) {
  const views = lContainer[VIEWS] as LView[];
  if (views) {
    for (let i = 0; i < views.length; i++) {
      if (lView === views[i]) return i;
    }
  }
  return -1;
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

/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {assertDefined, assertDomNode, assertEqual, assertGreaterOrEqual, assertLessThan} from '../util/assert';

import {assertLContainer, assertLView} from './assert';
import {getLContext} from './context_discovery';
import {appendChildViewDynamic, assignTViewNodeToLView, createLContainer, createLView, renderEmbeddedTemplate} from './instructions';
import {ACTIVE_INDEX, LContainer, VIEWS} from './interfaces/container';
import {TContainerNode, TElementNode, TNode} from './interfaces/node';
import {RComment, RNode} from './interfaces/renderer';
import {DECLARATION_VIEW, EmbeddedViewFactory, HOST, HOST_NODE, LView, LViewFlags, PARENT, QUERIES, RENDERER, TVIEW, View, ViewContainer} from './interfaces/view';
import {destroyLView, detachView, insertView, nativeInsertBefore, nativeParentNode, nativeRemoveChild, removeChild, removeView} from './node_manipulation';
import {getIsParent, setIsParent, setPreviousOrParentTNode} from './state';
import {getLContainer as readLContainer, getLastRootElementFromView, getRNode, isLContainer, isLView, readElementValue} from './util';



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
    const declarationTNode = declarationTView.data[lContext.nodeIndex] as TNode;
    const templateTView = declarationTNode.tViews;
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
            declarationTView.node !.injectorIndex = declarationTNode.injectorIndex;
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

  const index = insertAfterLView ? viewContainerIndexOfInternal(lContainer, insertAfterLView) + 1 :
                                   lContainer[ACTIVE_INDEX];
  insertView(lView, lContainer, index);

  assignTViewNodeToLView(tView, null, -1, lView);

  const referenceNode = insertAfterNode.nextSibling;
  while (tNode) {
    const node = lView[tNode.index];
    nativeInsertBefore(lView[RENDERER], containerNode.parentElement !, node, referenceNode);
    tNode = tNode.next;
  }
}

/**
 * Appends the view as the last view in the view container.
 * @param viewContainer The container to append the view to.
 * @param view The view to append.
 */
export function viewContainerAppend(viewContainer: ViewContainer, view: View): void {
  ngDevMode && assertLContainer(viewContainer, true);
  ngDevMode && assertLView(view, true);

  return viewContainerAppendInternal(viewContainer as any, view as any);
}

function viewContainerAppendInternal(lContainer: LContainer, lView: LView) {
  const index = viewContainerLengthInternal(lContainer) - 1;
  const afterLView = index >= 0 ? viewContainerGetInternal(lContainer, index) : null;
  viewContainerInsertAfterInternal(lContainer, lView, afterLView);
}

/**
 * Searches the `viewContainer` for a the first instance of a given `view` and returns its index
 * within the container, if the `view` is not found, it returns `-1`.
 * @param viewContainer The container to search
 * @param view The view to search for
 */
export function viewContainerIndexOf(viewContainer: ViewContainer, view: View): number {
  ngDevMode && assertLContainer(viewContainer, true);
  ngDevMode && assertLView(view, true);

  return viewContainerIndexOfInternal(viewContainer as any, view as any);
}

function viewContainerIndexOfInternal(lContainer: LContainer, lView: LView) {
  const views = lContainer[VIEWS] as LView[];
  if (views) {
    for (let i = 0; i < views.length; i++) {
      if (lView === views[i]) return i;
    }
  }
  return -1;
}

/**
 * Used to remove (embedded) views from a container. Will detach the view and destroy it, and will
 * also remove all DOM nodes associated with the view.
 * @param viewContainer The container to remove the view from
 * @param view The view to remove from the container
 */
export function viewContainerRemove(viewContainer: ViewContainer, view: View): void {
  ngDevMode && assertLContainer(viewContainer, true);
  ngDevMode && assertLView(view, true);
  viewContainerRemoveInternal(viewContainer as any, view as any);
}

function viewContainerRemoveInternal(lContainer: LContainer, lView: LView): void {
  const containerParentLView = lContainer[PARENT] !as LView;
  ngDevMode && assertLView(containerParentLView, true);
  const views = lContainer[VIEWS];
  for (let i = 0; i < views.length; i++) {
    const containedLView = views[i];
    if (containedLView === lView) {
      detachView(lContainer, i, false);
      destroyLView(containedLView);
      const tView = lView[TVIEW];
      let tNode = tView.firstChild;
      const renderer = lView[RENDERER];
      while (tNode) {
        const rNode = getRNode(lView, tNode.index);
        const parentRElement = nativeParentNode(renderer, rNode);
        if (parentRElement) {
          nativeRemoveChild(renderer, parentRElement, rNode);
        }
        tNode = tNode.next;
      }
    }
  }
}

/**
 * Gets the number of views in the container.
 * @param viewContainer The view container examine for length.
 */
export function viewContainerLength(viewContainer: ViewContainer): number {
  ngDevMode && assertLContainer(viewContainer, true);
  return viewContainerLengthInternal(viewContainer as any);
}

function viewContainerLengthInternal(lContainer: LContainer): number {
  const views = lContainer[VIEWS];
  return Array.isArray(views) ? views.length : 0;
}

/**
 * Retrieves a view from a container by index.
 * @param viewContainer The container to get the view from
 * @param index The index of the view to retrieve within the container.
 */
export function viewContainerGet(viewContainer: ViewContainer, index: number): View {
  ngDevMode && assertLContainer(viewContainer, true);
  ngDevMode && assertGreaterOrEqual(index, 0, 'index must be 0 or higher');
  ngDevMode && assertLessThan(
                   index, viewContainerLength(viewContainer),
                   'index must be less than the length of the container');
  const lView = viewContainerGetInternal(viewContainer as any, index);
  ngDevMode && assertLView(lView, true);
  return lView as any;
}

function viewContainerGetInternal(lContainer: LContainer, index: number): LView {
  return lContainer[VIEWS][index];
}

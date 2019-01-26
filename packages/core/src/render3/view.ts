/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {assertDefined, assertDomNode, assertEqual} from '../util/assert';

import {getLContext} from './context_discovery';
import {createLContainer, createLView, renderEmbeddedTemplate} from './instructions';
import {ACTIVE_INDEX, LContainer} from './interfaces/container';
import {TNode} from './interfaces/node';
import {RComment, RElement, RNode} from './interfaces/renderer';
import {DECLARATION_VIEW, EmbeddedViewFactory, FLAGS, HEADER_OFFSET, HOST, LView, LViewFlags, PARENT, QUERIES, RENDERER, TVIEW, View, ViewContainer} from './interfaces/view';
import {insertView, nativeInsertBefore} from './node_manipulation';
import {getIsParent, setIsParent, setPreviousOrParentTNode} from './state';
import {getLContainer as readLContainer, getLastRootElementFromView, readElementValue} from './util';



/*
test case:

Consider a template like:

<div/>
<ng-template #foo>content here</ng-template>

... should be

<div/>
<!-- content -->

1. grab div and convert into ViewContainer
2. grab content comment and convert into ViewFactory
3. Should Instantiate view from the view factory
4. Should be able to add the view to the view container (not implemented yet)
*/

/**
 *
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

          const lView =
              createLView(declarationLView, templateTView, context, LViewFlags.CheckAlways);
          lView[DECLARATION_VIEW] = declarationLView;

          createViewNode(-1, lView);

          // TODO(benlesh): confirm with Misko that this is the proper TView to check.
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
 *
 */
export function getViewContainer<T extends{} = {}>(node: RNode): ViewContainer|null {
  ngDevMode && assertDomNode(node);
  const lContext = getLContext(node);
  let lContainer: LContainer|null = null;
  if (lContext) {
    const lView = lContext.lView;
    const nodeIndex = lContext.nodeIndex;
    const lViewContainerOrElement: LContainer|RNode = lView[nodeIndex];
    lContainer = readLContainer(lViewContainerOrElement);
    if (!lContainer) {
      lContainer = lView[nodeIndex] = createLContainer(
          lViewContainerOrElement as RElement | RComment, lView,
          lViewContainerOrElement as RComment, true);
      addToViewTree(lView, lContainer);
    }
  }
  return lContainer as ViewContainer | null;
}


/**
 * TODO
 */
export function viewContainerInsertAfter(
    viewContainer: ViewContainer, view: View, insertAfter: View | null): void {
  // TODO(benlesh): refactor these functions to have internal versions.
  // TODO(benlesh): add assertions for the arguments, ensure they're the right type.
  const lContainer = viewContainer as any as LContainer;
  const lView = view as any as LView;
  const containerNode = readElementValue(lContainer[HOST]);
  // const node = readElementValue(lView[HOST]);
  const insertAfterNode =
      insertAfter ? getLastRootElementFromView(insertAfter as any as LView) : containerNode;
  const tView = lView[TVIEW];
  let tNode = tView.firstChild;
  ngDevMode && assertDefined(tNode, 'View has no nodes');

  insertView(lView, lContainer, lContainer[ACTIVE_INDEX]);

  debugger;
  const referenceNode = insertAfterNode.nextSibling;
  while (tNode) {
    const node = lView[tNode.index];
    nativeInsertBefore(lView[RENDERER], containerNode.parentElement !, node, referenceNode);
    tNode = tNode.next;
  }
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

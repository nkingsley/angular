/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {assertNumber} from '../util/assert';

import {attachPatchData} from './context_discovery';
import {NATIVE, VIEWS} from './interfaces/container';
import {TElementNode, TNode, TNodeFlags, TNodeType, TProjectionNode} from './interfaces/node';
import {RElement, RNode} from './interfaces/renderer';
import {LView, PARENT, T_HOST} from './interfaces/view';
import {addRemoveViewFromContainer, renderChild} from './node_manipulation';
import {findComponentView, getLViewParent, getNativeByTNode, isLContainer} from './util';



/**
 * Stack used to keep track of projection nodes in projection() instruction.
 *
 * This is deliberately created outside of projection() to avoid allocating
 * a new array each time the function is called. Instead the array will be
 * re-used by each invocation. This works because the function is not reentrant.
 */
export const projectionNodeStack: (LView | TNode)[] = [];

export function project(
    lView: LView, tProjectionNode: TProjectionNode, anchorNode: RNode | null,
    renderParent: RElement | null): void {
  // re-distribution of projectable nodes is stored on a component's view level
  const projectionSelectorIndex = tProjectionNode.projection as number;
  ngDevMode && assertNumber(projectionSelectorIndex, 'projection selector index must be a number');
  const componentView = findComponentView(lView);
  const componentNode = componentView[T_HOST] as TElementNode;
  const nodeToProject = componentNode.projection ![projectionSelectorIndex];
  let projectedLView = getLViewParent(componentView) !;
  let projectionNodeIndex = -1;

  if (Array.isArray(nodeToProject)) {
    renderChild(nodeToProject, lView, anchorNode, renderParent);
  } else {
    let currentNodeToProject: TNode|null = nodeToProject;
    while (currentNodeToProject) {
      if (currentNodeToProject.type === TNodeType.Projection) {
        // This node is re-projected, so we must go up the tree to get its projected nodes.
        const currentComponentView = findComponentView(projectedLView);
        const currentComponentHost = currentComponentView[T_HOST] as TElementNode;
        const firstProjectedNode: TNode|RNode[] =
            currentComponentHost.projection ![currentNodeToProject.projection as number];
        if (firstProjectedNode) {
          if (Array.isArray(firstProjectedNode)) {
            renderChild(firstProjectedNode, lView, anchorNode, renderParent);
          } else {
            projectionNodeStack[++projectionNodeIndex] = currentNodeToProject;
            projectionNodeStack[++projectionNodeIndex] = projectedLView;
            currentNodeToProject = firstProjectedNode;
            projectedLView = getLViewParent(currentComponentView) !;
            continue;
          }
        }
      } else {
        // This flag must be set now or we won't know that this node is projected
        // if the nodes are inserted into a container later.
        currentNodeToProject.flags |= TNodeFlags.isProjected;
        appendProjectedNode(
            currentNodeToProject, tProjectionNode, lView, projectedLView, anchorNode, renderParent);
      }
      // If we are finished with a list of re-projected nodes, we need to get
      // back to the root projection node that was re-projected.
      if (currentNodeToProject.next === null && projectedLView !== componentView[PARENT] !) {
        projectedLView = projectionNodeStack[projectionNodeIndex--] as LView;
        currentNodeToProject = projectionNodeStack[projectionNodeIndex--] as TNode;
      }
      currentNodeToProject = currentNodeToProject.next;
    }
  }
}


/**
 * Appends a projected node to the DOM, or in the case of a projected container,
 * appends the nodes from all of the container's active views to the DOM.
 *
 * @param projectedTNode The TNode to be projected
 * @param ngContentTNode The projection (ng-content) TNode
 * @param currentLView Current LView
 * @param projectionLView Projection view (view above current)
 */
function appendProjectedNode(
    projectedTNode: TNode, ngContentTNode: TNode, currentLView: LView, projectionLView: LView,
    anchorNode: RNode | null, renderParent: RElement | null): void {
  const projectedRNode = getNativeByTNode(projectedTNode, projectionLView);
  renderChild(projectedRNode, currentLView, anchorNode, renderParent);

  // the projected contents are processed while in the shadow view (which is the currentView)
  // therefore we need to extract the view where the host element lives since it's the
  // logical container of the content projected views
  attachPatchData(projectedRNode, projectionLView);

  const nodeOrContainer = projectionLView[projectedTNode.index];
  if (projectedTNode.type === TNodeType.Container) {
    // The node we are adding is a container and we are adding it to an element which
    // is not a component (no more re-projection).
    // Alternatively a container is projected at the root of a component's template
    // and can't be re-projected (as not content of any component).
    // Assign the final projection location in those cases.
    const views = nodeOrContainer[VIEWS];
    for (let i = 0; i < views.length; i++) {
      addRemoveViewFromContainer(views[i], true, nodeOrContainer[NATIVE]);
    }
  } else {
    if (projectedTNode.type === TNodeType.ElementContainer) {
      let ngContainerChildTNode: TNode|null = projectedTNode.child as TNode;
      while (ngContainerChildTNode) {
        appendProjectedNode(
            ngContainerChildTNode, ngContentTNode, currentLView, projectionLView, anchorNode,
            renderParent);
        ngContainerChildTNode = ngContainerChildTNode.next;
      }
    }

    if (isLContainer(nodeOrContainer)) {
      renderChild(nodeOrContainer[NATIVE], currentLView, anchorNode, renderParent);
    }
  }
}

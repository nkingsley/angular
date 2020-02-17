/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Observable} from 'rxjs/internal/Observable';
import {map} from 'rxjs/internal/operators/map';

import {assertExperimentalAgreement} from '../disclaimer/labs_disclaimer';
import {QueryMap, QuerySelector, queryAll} from '../query/query';
import {ComponentInstance} from '../types/component_instance';

import {$afterViewChanged} from './lifecycle';

export function $queryAll<M>(
    component: ComponentInstance, selector: QuerySelector): Observable<HTMLElement[]>;
export function $queryAll<M>(
    component: ComponentInstance, selector: QuerySelector, map: QueryMap<M>): Observable<M[]>;
export function $queryAll<M>(
    component: ComponentInstance, selector: QuerySelector,
    queryMap?: QueryMap<M>): Observable<HTMLElement[]|M[]> {
  assertExperimentalAgreement();
  return $afterViewChanged(component).pipe(
      map((component) => queryAll(component, selector, queryMap)));
}
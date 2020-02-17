/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Observable} from 'rxjs/internal/Observable';
import {assertExperimentalAgreement} from '../disclaimer/labs_disclaimer';
import {ComponentInstance} from '../types/component_instance';

export function $afterViewChanged(component: ComponentInstance): Observable<ComponentInstance> {
  assertExperimentalAgreement();
  return null !;
}
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component, Input, ɵdetectChanges as detectChanges,  defineInjector,
  NgModule,
  ɵdefaultIterableDiffers as defaultIterableDiffers,
  ɵdefineDirective as defineDirective,
  ɵinjectTemplateRef as injectTemplateRef,
  ɵinjectViewContainerRef as injectViewContainerRef,
  ɵrenderComponent as renderComponent} from '@angular/core';
import {TableCell, buildTable, emptyTable} from '../util';
import {CommonModule, NgForOf, NgIf} from '@angular/common';
import {bindAction, profile} from '../../util';

@Component({
  selector: 'large-table',
  template: `    
    <table>
      <tbody>
      <tr *ngFor="let row of data; trackBy: trackByIndex">
        <td *ngFor="let cell of row; trackBy: trackByIndex" [style.background-color]="cell.row % 2 ? '' : 'grey'">
          {{ cell.value }}
        </td>
      </tr>
      </tbody>
    </table>
  `,
})
export class LargeTableComponent {
  @Input()
  data: TableCell[][] = emptyTable;

  trackByIndex(index: number, item: any) {
    return index;
  }
}

export function destroyDom(component: LargeTableComponent) {
  component.data = emptyTable;
  detectChanges(component);
}

export function createDom(component: LargeTableComponent) {
  component.data = buildTable();
  detectChanges(component);
}

(CommonModule as any).ngInjectorDef = defineInjector({factory: () => new CommonModule});

(NgForOf as any).ngDirectiveDef = defineDirective({
  type: NgForOf,
  selectors: [['', 'ngFor', '', 'ngForOf', '']],
  factory: () => new NgForOf(
    injectViewContainerRef(), injectTemplateRef(),
    defaultIterableDiffers),
  features: [],
  inputs: {
    ngForOf: 'ngForOf',
    ngForTrackBy: 'ngForTrackBy',
    ngForTemplate: 'ngForTemplate',
  }
});

// TODO(misko): This hack is here because common is not compiled with Ivy flag turned on.
(NgIf as any).ngDirectiveDef = defineDirective({
  type: NgIf,
  selectors: [['', 'ngIf', '']],
  factory: () => new NgIf(injectViewContainerRef(), injectTemplateRef()),
  inputs: {ngIf: 'ngIf', ngIfThen: 'ngIfThen', ngIfElse: 'ngIfElse'}
});

@NgModule({declarations: [LargeTableComponent], imports: [CommonModule]})
export class LargeTableModule {
}

const component = (window as any).largeTableComponent = renderComponent(LargeTableComponent);

bindAction('#createDom', () => createDom(component));
bindAction('#destroyDom', () => destroyDom(component));
bindAction('#updateDomProfile', profile(() => createDom(component), () => {}, 'update'));
bindAction(
  '#createDomProfile',
  profile(() => createDom(component), () => destroyDom(component), 'create'));


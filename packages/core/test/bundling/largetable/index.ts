/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {CommonModule, NgForOf, NgIf} from '@angular/common';
import {ChangeDetectionStrategy, ChangeDetectorRef, Component, ViewChild, EventEmitter, InjectFlags, Injectable, Input, IterableDiffers, NgModule, Output, createInjector, defineInjector, inject, ɵComponentDef as ComponentDef, ɵComponentType as ComponentType, ɵDirectiveDef as DirectiveDef, ɵDirectiveType as DirectiveType, ɵNgOnChangesFeature as NgOnChangesFeature, ɵdefaultIterableDiffers as defaultIterableDiffers, ɵdefineDirective as defineDirective, ɵinjectTemplateRef as injectTemplateRef, ɵinjectViewContainerRef as injectViewContainerRef, ɵmarkDirty as markDirty, ɵrenderComponent as renderComponent, ɵPublicFeature as PublicFeature, ɵdetectChanges as detectChanges} from '@angular/core';


export class TableCell {
  constructor(public row: number, public col: number, public value: string) {}
}

let tableCreateCount: number;
export let maxRow: number;
export let maxCol: number;
let numberData: TableCell[][];
let charData: TableCell[][];

init();

function init() {
  maxRow = 50;
  maxCol = 200;
  tableCreateCount = 0;
  numberData = [];
  charData = [];
  for (let r = 0; r <= maxRow; r++) {
    const numberRow: TableCell[] = [];
    numberData.push(numberRow);
    const charRow: TableCell[] = [];
    charData.push(charRow);
    for (let c = 0; c <= maxCol; c++) {
      numberRow.push(new TableCell(r, c, `${c}/${r}`));
      charRow.push(new TableCell(r, c, `${charValue(c)}/${charValue(r)}`));
    }
  }
}

function charValue(i: number): string {
  return String.fromCharCode('A'.charCodeAt(0) + (i % 26));
}

export const emptyTable: TableCell[][] = [];

export function buildTable(): TableCell[][] {
  tableCreateCount++;
  return tableCreateCount % 2 ? numberData : charData;
}

let table: TableComponent;
@Component({
  selector: 'table-comp',
  template: `
    <button (click)="create()">Create</button>
    <button (click)="destroy()">Destroy</button>
    
    <table>
      <tbody>
      <tr *ngFor="let row of data">
        <td *ngFor="let cell of row" [style.background-color]="cell.row % 2 ? '' : 'grey'">
          {{ cell.value }}
        </td>
      </tr>
      </tbody>
    </table>
  `,
})
export class TableComponent {
  @Input()
  data = emptyTable;

  constructor() {
    setTimeout(() => {
      this.profileCreate();
    }, 1000);
  }

  create() {
    this.data = buildTable();
    detectChanges(this);
  }

  destroy() {
    this.data = emptyTable;
    detectChanges(this);
  }

  profileCreate() {
    profile(() => this.create(), () => this.destroy(), 'create');
  }

  profileUpdate() {
    profile(() => this.create(), () => {}, 'update');
  }
}

export function profile(create: () => void, destroy: () => void, name: string) {
    window.console.profile(name);
    let duration = 0;
    let count = 0;
    while (count++ < 20) {
      const start = window.performance.now();
      create();
      duration += window.performance.now() - start;
      destroy();
    }
    window.console.profileEnd();
    window.console.log(`Iterations: ${count}; time: ${duration / count} ms / iteration`);
}


// TODO(misko): This hack is here because common is not compiled with Ivy flag turned on.
(CommonModule as any).ngInjectorDef = defineInjector({factory: () => new CommonModule});

// TODO(misko): This hack is here because common is not compiled with Ivy flag turned on.
(NgForOf as any).ngDirectiveDef = defineDirective({
  type: NgForOf,
  selectors: [['', 'ngFor', '', 'ngForOf', '']],
  factory: () => new NgForOf(
               injectViewContainerRef(), injectTemplateRef(),
               // TODO(misko): inject does not work since it needs to be directiveInject
               // inject(IterableDiffers, defaultIterableDiffers)
               defaultIterableDiffers),
  features: [NgOnChangesFeature({
    ngForOf: 'ngForOf',
    ngForTrackBy: 'ngForTrackBy',
    ngForTemplate: 'ngForTemplate',
  })],
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

@NgModule({declarations: [TableComponent], imports: [CommonModule]})
export class ToDoAppModule {
}

// TODO(misko): create cleaner way to publish component into global location for tests.
(window as any).toDoAppComponent = renderComponent(TableComponent);


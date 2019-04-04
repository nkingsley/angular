/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component, NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';


@Component({
  selector: 'application',
  template: `
  <button (click)="reset()" id="reset">Reset</button>
  <button (click)="build()" id="build">Build Table</button>
  <hr>
  Row count = {{rows.length}};
  <table>
    <thead>
      <th>No.</th>
      <th>Description</th>
      <th></th>
    </thead>
    <tr *ngFor="let row of rows">
      <td>{{row.index}}</td>
      <td>{{row.text}}</td>
      <td>
        <button (click)="removeRow(row)">X</button>
      </td>
    </tr>
  </table>
  <hr>
`
})
export class ApplicationComponent {
  rows: Row[] = [];

  reset() { this.rows.length = 0; }

  build() {
    this.reset();
    for (let i = 0; i < 1000; i++) {
      this.rows.push({
        index: i,
        text: 'Row ' + i,
      });
    }
  }

  removeRow(row: Row) {
    const index = this.rows.indexOf(row);
    if (index >= 0) {
      this.rows.splice(index, 1);
    }
  }
}

interface Row {
  index: number;
  text: string;
}

@NgModule({
  declarations: [ApplicationComponent],
  imports: [BrowserModule],
  bootstrap: [ApplicationComponent]
})
export class ApplicationModule {
}

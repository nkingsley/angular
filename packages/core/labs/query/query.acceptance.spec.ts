/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component} from '@angular/core/src/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';

import {diffArray} from '../diff/diff';
import {AfterViewChanged} from '../lifecycle/after_view_changed';
import {$queryAll} from '../observable/query';

import {query, queryAll} from './query';

xdescribe('query', () => {
  it('should retrieve element by ref-id', () => {
    let retrievedElement: HTMLElement|null = null;
    @Component({template: `<div #myRef>text</div>`})
    class MyComponent implements AfterViewChanged {
      constructor() {
        // At this point there is no DOM, so we can't retrieve anything.
        expect(() => query(this, '#myRef')).toThrow();
      }

      ngAfterViewChanged() {
        // This is ideal place to do it since any structural changes will cause a re-query
        retrievedElement = query(this, '#myRef');
      }
    }
    TestBed.configureTestingModule({declarations: [MyComponent]});
    const fixture = TestBed.createComponent(MyComponent);
    const div = (fixture.nativeElement as HTMLElement).querySelector('div') !;
    fixture.detectChanges();
    expect(retrievedElement !).toBe(div);
  });

  describe('retrieval modes', () => {
    let fixture: ComponentFixture<RetrieveModesComponent>;
    let component: RetrieveModesComponent;

    @Component({
      template: `
        <div #topDiv>
          <div #nestedDiv>
            <div #nestedDiv></div>
          </div> 
        </div>
        <ul>
          <li *ngFor="item of items" #item>{{item}}</li>
        </ul>
    `
    })
    class RetrieveModesComponent implements AfterViewChanged {
      items: string[] = [];
      ngAfterViewChanged() {
        // If the `ngAfterViewChanged` was overwritten on instance level that call it.
        if (this.ngAfterViewChanged !== RetrieveModesComponent.prototype.ngAfterViewChanged) {
          this.ngAfterViewChanged();
        }
      }
    }

    beforeEach(() => {
      TestBed.configureTestingModule({declarations: [RetrieveModesComponent]});
      fixture = TestBed.createComponent(RetrieveModesComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });

    it('should query individual items', () => {
      const [topDiv, nestedDiv1, nestedDiv2] =
          (fixture.nativeElement as HTMLElement).querySelectorAll('div') as any;
      expect(query(fixture.componentInstance, '#dont-exist')).toBe(null);
      expect(query(fixture.componentInstance, '#topDiv')).toBe(topDiv);
      expect(query(fixture.componentInstance, '#nestedDiv')).toBe(nestedDiv1);
    });

    it('should queryAll items', () => {
      const [topDiv, nestedDiv1, nestedDiv2] =
          (fixture.nativeElement as HTMLElement).querySelectorAll('div') as any;
      expect(queryAll(fixture.componentInstance, '#dont-exist')).toBe([]);
      expect(queryAll(fixture.componentInstance, '#topDiv')).toBe([topDiv]);
      expect(queryAll(fixture.componentInstance, '#nestedDiv')).toBe([nestedDiv1, nestedDiv2]);
    });

    it('should support re-query when structure changes', () => {
      let queryResult !: HTMLElement[];
      (component.ngAfterViewChanged = () => queryResult = queryAll(component, 'item'))();
      expect(queryResult).toBe([]);
      fixture.componentInstance.items = ['A', 'B'];
      fixture.detectChanges();
      expect(queryResult).toBe(fixture.nativeElement.querySelectorAll('li'));
    });

    describe('query diff', () => {
      it('should compute diff from last execution', () => {
        const log: any[] = [];
        let queryResult: HTMLElement[]|null = null;
        (component.ngAfterViewChanged = () => queryResult =
             diffArray(queryAll(component, 'item'), queryResult, {
               added: (item: HTMLElement) => log.push('+', item),
               removed: (item: HTMLElement) => log.push('-', item)
             }))();
        const [li1, li2] = fixture.nativeElement.querySelectorAll('li');
        expect(log).toEqual(['+', li1, '+', li2]);
        log.length = 0;
        component.items = ['A', 'C'];
        fixture.detectChanges();
        const [_li1, _li2] = fixture.nativeElement.querySelectorAll('li');
        expect(log).toEqual(['-', li2, '+', _li2]);
      });
    });

    describe('observables', () => {
      it('should compute diff from last execution', () => {
        let observableValue: HTMLElement[]|null = null;
        $queryAll(component, '#item').subscribe((value) => observableValue);
      });
    });
  });
});
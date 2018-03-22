/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {CommonModule, NgForOf} from '@angular/common';
import {Component, EventEmitter, Injectable, Input, NgModule, Output, createInjector, defineInjector, ɵdefineDirective as defineDirective, ɵmarkDirty as markDirty, ɵrenderComponent as renderComponent, ɵinjectViewContainerRef as injectViewContainerRef, ɵinjectTemplateRef as injectTemplateRef, IterableDiffers, inject, InjectFlags, ɵdefaultIterableDiffers as defaultIterableDiffers, ɵNgOnChangesFeature as NgOnChangesFeature,} from '@angular/core';

export interface ToDo {
  text: string;
  done: boolean;
}
@Injectable({providedIn: 'root'})
export class AppState {
  todos: ToDo[] = [
    {text: 'Demonstrate Components', done: false},
    {text: 'Demonstrate Structural Directives', done: true},
    {text: 'Demonstrate NgModules', done: false},
    {text: 'Demonstrate zoneless changed detection', done: false},
    {text: 'Demonstrate internationalization', done: false},
  ];

  static DEFAULT_TODO = {text: '', done: false};
}

@Component({
  selector: 'todo',
  // TODO(misko): `[class.done]` and `[value]` should be `todo.done` not `todo && todo.todo.done`
  // The reason for the guard is that template executes creation and binding together
  // but NgForOf expects creation and binding separate.
  template: `
    <div [class.done]="todo && todo.done">
      <input type="checkbox" [value]="todo && todo.done" (click)="onCheckboxClick()">
      <span>{{todo && todo.text}}</span>
      <button (click)="onArchiveClick()">archive</button>
    </div>
  `
})
export class TodoComponent {
  static DEFAULT_TODO: ToDo = {text: '', done: false};

  @Input()
  todo: ToDo = AppState.DEFAULT_TODO;

  @Output()
  archive = new EventEmitter();

  onCheckboxClick() {
    this.todo.done = !this.todo.done;
  }

  onArchiveClick() { this.archive.emit(this.todo); }
}

@Component({
  selector: 'todo-app',
  template: `
  <h1>ToDo Application</h1>
  <div>
    <todo *ngFor="let todo of appState.todos" [todo]="todo" (archive)="onArchive($event)"></todo>
  </div>
  <span>count: {{appState.todos.length}}.</span>
  `
})
export class ToDoAppComponent {
  public appState: AppState;

  // TODO(misko): Injection is broken because the compiler generates incorrect code.
  constructor(/**appState: AppState*/) {
    // TODO(misko): remove once injection is working.
    this.appState = new AppState();
  }

  onArchive(item: ToDo) {
    const todos = this.appState.todos;
    todos.splice(todos.indexOf(item));
    markDirty(this);
  }
}

// TODO(misko): This hack is here because common is not compiled with Ivy flag turned on.
(CommonModule as any).ngInjectorDef = defineInjector({factory: () => new CommonModule});

// TODO(misko): This hack is here because common is not compiled with Ivy flag turned on.
(NgForOf as any).ngDirectiveDef = defineDirective({
  type: NgForOf,
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


@NgModule({declarations: [ToDoAppComponent, TodoComponent], imports: [CommonModule]})
export class ToDoAppModule {
}


renderComponent(ToDoAppComponent, {
  // TODO(misko): This should run without injector.
  injector: createInjector(ToDoAppModule)
});
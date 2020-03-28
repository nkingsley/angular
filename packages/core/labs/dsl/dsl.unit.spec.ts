/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Directive, Pipe, PipeTransform} from '@angular/core';

import {defineComponent} from './dsl';

describe('dsl', () => {

  // Let's say you would like to express this template programmatically.
  `<div id="my-id" [title]="name" my-directive>Hello {{name|}}!</div>`;


  // First, we need to declare a component which will be used as context.
  // Notice no `@Component()`.
  class MyComponent {
    name: string = '';
    doSomething() {}
  }

  // Just for fun we include a pipe
  @Pipe({name: 'capitalize'})
  class CapitalizePipe implements PipeTransform {
    transform(value: string): string { return value.toUpperCase(); }
  }

  // Just for fun we also include an existing directive
  // This directive could also be declared pragmatically as well.
  @Directive({selector: '[my-directive]'})
  class MyDirective {
  }

  // Now programmatically upgrade the `MyComponent` to full Angular Component.
  // This will be indistinguishable at runtime from full declared component such as:
  // ```
  // @Component({
  //   template: `<div id="my-id" [title]="name" my-directive>Hello {{name|}}!</div>`
  // })
  // class MyComponent {}
  // ```
  defineComponent(MyComponent, ({element, attr, bind, text, pipe, interpolate, directive}) => {
    const capitalize = pipe(CapitalizePipe);
    // <div id="my-id" [title]="name" my-directive>
    element(
        'div', attr('id', 'my-id'), bind('title', ctx => ctx.name), directive(MyDirective),  //
        () => {
          // Hello {{name|}}!
          text(interpolate('Hello ', ctx => capitalize(ctx.name), '!'));
        });
  });

  // The benefit of declaring the components this way is that the declaration of the component
  // template can be delayed
  // until runtime. At runtime it would be possible to use data-driven approach to build the UI in a
  // programmatic way.

  // Contrived example:

  const configuration: any =
      null !;  // assume this contains some data which is only known at runtime:

  class MyRuntimeComponent {
    list: string[][] = [];
  }

  // Notice How we can dynamically create a table with the correct number of
  // rows and columns without using nested `*ngFor`
  // (`*ngFor` would be a lot more computationally expensive.)
  defineComponent(MyRuntimeComponent, ({element, text}) => {
    element('table', () => {
      configuration.rows.forEach((cols: any[], rowIndex: number) => {
        element('tr', () => {
          cols.forEach((cell: any, colIndex: number) => {
            element('td', () => {
              text(c => c.list[rowIndex][colIndex]);  //
            });
          });
        });
      });
    });
  });
});
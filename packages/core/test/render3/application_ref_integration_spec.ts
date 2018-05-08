/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ApplicationModule, ChangeDetectorRef, ComponentFactory as viewEngine_ComponentFactory, ComponentFactoryResolver as viewEngine_ComponentFactoryResolver, ComponentRef as viewEngine_ComponentRef, ElementRef, InjectFlags, Injector, InjectorType, NgModuleFactory as viewEngine_NgModuleFactory, NgModuleRef as viewEngine_NgModuleRef, NgZone, RendererFactory2, StaticProvider, Type, ViewRef, createInjector, defineInjector, inject} from '@angular/core';
import {withBody} from '@angular/core/testing';
import {BrowserModule, EVENT_MANAGER_PLUGINS, platformBrowser} from '@angular/platform-browser';

import {BROWSER_MODULE_PROVIDERS} from '../../../platform-browser/src/browser';
import {APPLICATION_MODULE_PROVIDERS} from '../../src/application_module';
import {ApplicationRef} from '../../src/application_ref';
import {InternalNgModuleRef} from '../../src/linker/ng_module_factory';
import {assertComponentType} from '../../src/render3/assert';
import {ComponentDef, ComponentType, RenderFlags, defineComponent} from '../../src/render3/index';
import {elementEnd, elementStart, locateHostElement, text} from '../../src/render3/instructions';
import {stringify} from '../../src/util';
import {NoopNgZone} from '../../src/zone/ng_zone';

fdescribe('ApplicationRef bootstrap', () => {
  class HelloWorldComponent {
    static ngComponentDef = defineComponent({
      type: HelloWorldComponent,
      selectors: [['hello-world']],
      factory: () => new HelloWorldComponent(),
      template: function(rf: RenderFlags, ctx: HelloWorldComponent): void {
        if (rf & RenderFlags.Create) {
          elementStart(0, 'div');
          text(1, 'Hello World');
          elementEnd();
        }
      }
    });
  }

  class MyAppModule {
    static ngInjectorDef = defineInjector({
      factory: () => new MyAppModule(),
      imports: [BrowserModule],
    });
    static ngModuleDef = defineNgModule({bootstrap: [HelloWorldComponent]});
  }

  it('should bootstrap hello world', withBody('<hello-world></hello-world>', () => {
       const MyAppModuleFactory = new NgModuleFactory(MyAppModule);
       const platform = platformBrowser();
       platform.bootstrapModuleFactory(MyAppModuleFactory);
       expect(document.body.innerHTML).toEqual('<hello-world>Hello World</hello-world>');
       platform.destroy();
     }));

});

/////////////////////////////////////////////////////////

class NgZoneModule {
  static ngInjectorDef = defineInjector({
    factory: () => new NgZoneModule(),
    providers: [{provide: NgZone, factory: () => new NoopNgZone()}]
  });
}

(BrowserModule as any as InjectorType<BrowserModule>).ngInjectorDef = defineInjector({
  factory: function BrowserModule_Factory() {
    return new BrowserModule(inject(BrowserModule, InjectFlags.Optional | InjectFlags.SkipSelf));
  },
  imports: [ApplicationModule],
  providers: BROWSER_MODULE_PROVIDERS
});

(ApplicationModule as any as InjectorType<ApplicationModule>).ngInjectorDef = defineInjector({
  factory: function ApplicationModule_Factory() {
    return new ApplicationModule(inject(ApplicationRef));
  },
  providers: APPLICATION_MODULE_PROVIDERS
});

/////////////////////////////////////////////////////////

export function defineNgModule({bootstrap}: {bootstrap?: Type<any>[]}): NgModuleDef {
  return { bootstrap: bootstrap || [], }
}

export class ComponentFactoryResolver extends viewEngine_ComponentFactoryResolver {
  resolveComponentFactory<T>(component: Type<T>): viewEngine_ComponentFactory<T> {
    ngDevMode && assertComponentType(component);
    const componentDef = (component as ComponentType<T>).ngComponentDef;
    return new ComponentFactory(componentDef);
  }
}

function toRefArray(map: {[key: string]: string}): {propName: string; templateName: string;}[] {
  const array: {propName: string; templateName: string;}[] = [];
  for (let nonMinified in map) {
    if (map.hasOwnProperty(nonMinified)) {
      const minified = map[nonMinified];
      array.push({propName: minified, templateName: nonMinified});
    }
  }
  return array;
}

export class ComponentFactory<T> extends viewEngine_ComponentFactory<T> {
  selector: string;
  componentType: Type<any>;
  ngContentSelectors: string[];
  get inputs(): {propName: string; templateName: string;}[] {
    return toRefArray(this.componentDef.inputs);
  };
  get outputs(): {propName: string; templateName: string;}[] {
    return toRefArray(this.componentDef.outputs);
  };

  constructor(private componentDef: ComponentDef<any>) {
    super();
    this.componentType = componentDef.type;
    this.selector = componentDef.selectors[0][0] as string;
    this.ngContentSelectors = [];
  }

  create(
      injector: Injector, projectableNodes?: any[][]|undefined, rootSelectorOrNode?: any,
      ngModule?: viewEngine_NgModuleRef<any>|undefined): viewEngine_ComponentRef<T> {
    const rendererFactory = ngModule ? ngModule.injector.get(RendererFactory2) : document;
    const hostNode = locateHostElement(rendererFactory, rootSelectorOrNode);
    // TODO(misko): this is the wrong injector here.
    return new ComponentRef(ngModule !.injector);
  }
}

export class ComponentRef<T> extends viewEngine_ComponentRef<T> {
  destroyCbs: (() => void)[]|null = [];
  location: ElementRef<any>;
  injector: Injector;
  instance: T;
  hostView: ViewRef;
  changeDetectorRef: ChangeDetectorRef;
  componentType: Type<any>;

  constructor(injector: Injector) {
    super();
    this.injector = injector;
  }

  destroy(): void {
    assertNotDestroyed(this.destroyCbs);
    this.destroyCbs !.forEach(fn => fn());
    this.destroyCbs = null;
  }
  onDestroy(callback: () => void): void {
    assertNotDestroyed(this.destroyCbs);
    this.destroyCbs !.push(callback);
  }
}

export interface NgModuleType { ngModuleDef: NgModuleDef; }

export interface NgModuleDef { bootstrap: Type<any>[] }

export const COMPONENT_FACTORY_RESOLVER: StaticProvider = {
  provide: viewEngine_ComponentFactoryResolver,
  useFactory: () => new ComponentFactoryResolver(),
  deps: [],
};

export class NgModuleRef<T> extends viewEngine_NgModuleRef<T> implements InternalNgModuleRef<T> {
  _bootstrapComponents: Type<any>[] = [];
  injector: Injector;
  componentFactoryResolver: viewEngine_ComponentFactoryResolver;
  instance: T;
  destroyCbs: (() => void)[]|null = [];

  constructor(ngModuleType: Type<T>, parentInjector: Injector|null) {
    super();
    const ngModuleDef = (ngModuleType as any as NgModuleType).ngModuleDef;
    if (!ngModuleDef) {
      // TODO(misko): move to assert
      throw new Error(`NgModule '${stringify(ngModuleType)}' is not a subtype of 'NgModuleType'.`);
    }
    console.log('Bootstrap:', ngModuleDef.bootstrap);
    this._bootstrapComponents = ngModuleDef.bootstrap;
    const additionalProviders: StaticProvider[] = [
      COMPONENT_FACTORY_RESOLVER, {
        provide: viewEngine_NgModuleRef,
        useValue: this,
      }
    ];
    this.injector = createInjector(ngModuleType, parentInjector, additionalProviders);
    this.instance = this.injector.get(ngModuleType);
    this.componentFactoryResolver = null !;
  }

  destroy(): void {
    assertNotDestroyed(this.destroyCbs);
    this.destroyCbs !.forEach(fn => fn());
    this.destroyCbs = null;
  }
  onDestroy(callback: () => void): void {
    assertNotDestroyed(this.destroyCbs);
    this.destroyCbs !.push(callback);
  }
}

function assertNotDestroyed(destroyCbs: (() => void)[] | null) {
  if (!destroyCbs) {
    throw new Error('NgModule already destroyed');
  }
}

export class NgModuleFactory<T> extends viewEngine_NgModuleFactory<T> {
  constructor(public moduleType: Type<T>) { super(); }

  create(parentInjector: Injector|null): viewEngine_NgModuleRef<T> {
    return new NgModuleRef(this.moduleType, parentInjector);
  }
}

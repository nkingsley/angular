/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {createTextNode} from './ivy_util';

export interface Type<T> extends Function {}
export type CssSelectorList = any;
export type ComponentTemplate<T> = Function;
export type Provider = any;
export type ComponentDefFeature = any;
export type RendererType2 = any;
export type Renderer3 = any;
export type DirectiveTypesOrFactory = any;
export type PipeTypesOrFactory = any;
export interface ComponentDef<T> {
  selectors: string[][];
  factory: () => T;
  template: Function;
  type: Type<any>;
  tView: TView;
}
export const enum ChangeDetectionStrategy {OnPush = 1}
export interface TNode {
  next: TNode|null;
  index: number;
  parent: TNode|null;
  view: TView|null;
}
export interface TView extends TNode { isFirstTime: boolean; }
export interface TElement extends TNode {}
export const enum RenderFlags {
  /* Whether to run the creation block (e.g. create elements and directives) */
  Create = 0b01,

  /* Whether to run the update block (e.g. refresh bindings) */
  Update = 0b10
}

export type TemplateData = [TView | null, any[] /*TemplateData*/ | null, Renderer3] & {
  [key: number]: any;
  length: number;
};


//////////////////
let tView: TView = null !;
let tView_isFirstTime: boolean = true;
let renderer: any = null;
let currentOrParentNode: TNode = null !;
let isParent: boolean = true;
let data: TemplateData = null !;
const DATA_OFFSET = 3;
//////////////////

export function renderTemplate(template: Function, templateData: TemplateData) {
  let _data = templateData;
  let _tView = tView;
  let _tView_isFirstTime = tView_isFirstTime;
  let _renderer = renderer;
  let _currentOrParentNode = currentOrParentNode;
  let _isParent = isParent;

  data = templateData;
  tView = getTView(templateData);
  tView_isFirstTime = tView.isFirstTime;
  renderer = getRenderer(templateData);
  currentOrParentNode = tView;
  isParent = true;

  try {
    template(tView ? RenderFlags.Create : RenderFlags.Update, data);
  } finally {
    // restore
    data = _data;
    tView = _tView;
    tView_isFirstTime = _tView_isFirstTime;
    renderer = _renderer;
    currentOrParentNode = _currentOrParentNode;
    isParent = _isParent;
  }
}

function getTView(data: TemplateData): TView {
  return data[0] !;
}

function getRenderer(data: TemplateData): Renderer3 {
  return data[2];
}

export function text(index: number, value?: any): void {
  index += DATA_OFFSET;
  const textNode = createTextNode(value, renderer);
  if (tView_isFirstTime) {
    currentOrParentNode = createElementNode(index);
  } else {
    currentOrParentNode =
        isParent ? currentOrParentNode : currentOrParentNode.next || currentOrParentNode.parent !;
  }
  data[index] = textNode;

  // Text nodes are self closing.
  isParent = false;
  getParentElement(data, currentOrParentNode).append(textNode);
}

export const domRendererFactory3: any = {
  createRenderer: (hostElement: any | null, rendererType: RendererType2 | null):
                      Renderer3 => { return document;}
};

function createTemplateData(
    tView: TView | null, parent: any[] | null, renderer: any): TemplateData {
  return [tView, parent, renderer];
}

export function renderComponent<T>(componentType: Type<T>, opts: any = {}): T {
  const rendererFactory = opts.rendererFactory || domRendererFactory3;
  const componentDef = (componentType as any).ngComponentDef as ComponentDef<T>;
  if (componentDef.type != componentType) componentDef.type = componentType;
  // The first index of the first selector is the tag name.
  const componentTag = componentDef.selectors ![0] ![0] as string;
  const hostNode = document.querySelector(opts.host || componentTag);
  const hostTemplate = createViewNode();
  const hostTemplateInstanceData = createTemplateData(hostTemplate, null, null);
  hostTemplate.index = 1;
  hostTemplateInstanceData[1] = hostNode;
  renderTemplate(
      () => hostTemplateInstanceData[4] = componentDef.factory(), hostTemplateInstanceData);

  const templateHostInstanceData = createTemplateData(null, null, null);
  const templateInstanceData =
      createTemplateData(componentDef.tView, hostTemplateInstanceData, opts.renderer || document);
  renderTemplate(componentDef.template, templateInstanceData);

  return hostTemplateInstanceData[4];
}

function getParentElement(data: TemplateData, tNode: TNode) {
  let parentNode = tNode.parent;
  if (parentNode == null || parentNode.index == -1) {
    // We are crossing view boundaries
    data = getParentTemplateData(data);
    parentNode = getTView(data);
  }
  return data[parentNode !.index];
}

function getParentTemplateData(data: TemplateData): TemplateData {
  return data[1] as TemplateData;
}

function createElementNode(index: number): TElement {
  return {
    parent: isParent ? currentOrParentNode : currentOrParentNode.parent,
    next: null,
    index: index,
    view: tView,
  };
}

export function createViewNode(): TView {
  return {
    parent: null,
    index: -1,
    isFirstTime: true,
    next: null,
    view: null,
  };
}

export function defineComponent<T>(componentDefinition: {
  type: Type<T>; selectors: CssSelectorList;
  factory: () => T | ({0: T} & any[]); /* trying to say T | [T, ...any] */
  attributes?: string[];
  inputs?: {[P in keyof T]?: string};
  outputs?: {[P in keyof T]?: string};
  hostBindings?: (directiveIndex: number, elementIndex: number) => void;
  exportAs?: string;
  template: ComponentTemplate<T>;
  features?: ComponentDefFeature[];
  rendererType?: RendererType2;
  changeDetection?: ChangeDetectionStrategy;
  providers?: Provider[];
  viewProviders?: Provider[];
  directives?: DirectiveTypesOrFactory | null;
  pipes?: PipeTypesOrFactory | null;
}): never {
  const type = componentDefinition.type;
  const pipeTypes = componentDefinition.pipes !;
  const directiveTypes = componentDefinition.directives !;
  const def = <any>{
    type: type,
    diPublic: null,
    factory: componentDefinition.factory,
    template: componentDefinition.template || null !,
    hostBindings: componentDefinition.hostBindings || null,
    attributes: componentDefinition.attributes || null,
    inputs: componentDefinition.inputs,
    outputs: componentDefinition.outputs,
    rendererType: componentDefinition.rendererType || null,
    exportAs: componentDefinition.exportAs,
    onInit: type.prototype.ngOnInit || null,
    doCheck: type.prototype.ngDoCheck || null,
    afterContentInit: type.prototype.ngAfterContentInit || null,
    afterContentChecked: type.prototype.ngAfterContentChecked || null,
    afterViewInit: type.prototype.ngAfterViewInit || null,
    afterViewChecked: type.prototype.ngAfterViewChecked || null,
    onDestroy: type.prototype.ngOnDestroy || null,
    onPush: componentDefinition.changeDetection === ChangeDetectionStrategy.OnPush,
    directiveDefs: directiveTypes || null,
    pipeDefs: pipeTypes || null,
    selectors: componentDefinition.selectors,
    tView: createViewNode(),
  };
  const feature = componentDefinition.features;
  feature && feature.forEach((fn) => fn(def));
  return def as never;
}

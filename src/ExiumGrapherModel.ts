import {
  ExiumContext,
  ExiumDocument,
  ContextTypes,
} from '../deps/exium.ts';
import { join } from '../deps/path.ts';

export interface ExiumGrapherModelInterface {
  url: URL;
  document: ExiumDocument;
  fileDependencies: ExiumGrapherModel[];
}
export interface ExiumGrapherModelOptions {
  reader: (url: URL) => Promise<string>,
  url: URL,
  source: string,
  cwd: ReturnType<typeof Deno['cwd']>;
  parent?: ExiumGrapherModel;
}
export class ExiumGrapherModel implements ExiumGrapherModelInterface {
  /**
   * save all files, retrieve them with the path
   */
  static mapFiles: Map<string, ExiumGrapherModel> = new Map();
  baseURL: null | string = null;
  fileDependencies: ExiumGrapherModelInterface['fileDependencies'] = [];
  document: ExiumDocument;
  constructor(private opts: ExiumGrapherModelOptions) {
    this.document = new ExiumDocument({
      url: opts.url,
      onError() { },
      source: opts.source,
      options: { type: 'deeper' },
    });
    ExiumGrapherModel.mapFiles.set(opts.url.href, this);
  }
  get url() {
    return this.opts.url;
  }
  get reader() {
    return this.opts.reader;
  }
  get cwd() {
    return this.opts.cwd;
  }
  get parent() {
    return this.opts.parent;
  }
  get isRemote(): boolean {
    return ['http:', 'https:'].includes(this.url.protocol) || !!(this.parent?.isRemote);
  }
  /**
   * require a dependency and start saving this dependency
   * @param importCTX ExiumContext: ImportStatement
   */
  async require(importCTX: ExiumContext): Promise<ExiumGrapherModel | undefined> {
    const invalid = new Error('incorrect context, the ExiumContext provided in the first argument is not an ImportStatement');
    if (!importCTX) throw invalid;
    const path = importCTX.getImportPath();
    if (path) {
      const newurl = this.getURL(path);
      const source = await this.reader(newurl);
      const dependency = new ExiumGrapherModel({
        url: newurl,
        cwd: this.opts.cwd,
        reader: this.opts.reader,
        parent: this,
        source,
      });
      this.fileDependencies.push(dependency);
      return dependency;
    } else {
      throw invalid;
    }
  }
  setBaseURL() {
    const urlsearch = new URLSearchParams(this.url.search);
    // save and remove the @ key
    this.baseURL = urlsearch.get('@');
    urlsearch.delete('@');
    this.url.search = urlsearch.toString();
  }
  getURL(path: string): URL {
    // first set the baseURL if there's any search param
    this.setBaseURL();
    // start to compute the url
    const { isRemote } = this;
    const isRelative = path.startsWith('.');
    const isScoped = path.startsWith('@/');
    const reg = /^\@\//i;
    console.warn(this.baseURL);
    let finalPath = isScoped ?
      isRemote && this.baseURL ?
        join(this.url.origin, this.baseURL, path.replace(reg, './')) :
        path.replace(reg, `file:///${this.opts.cwd.replace(/\/+$/, '')}/`) :
      isRemote && isRelative ?
        join(this.url.origin, path) : path;
    return isRelative ?
      new URL(finalPath, this.opts.url)
      : new URL(finalPath);
  }
  async resolve() {
    const { document } = this;
    const { contexts } = document;
    const imports = contexts.filter((context: ExiumContext) => context.type === ContextTypes.ImportStatement && context.data.isComponent)
    for await (let importCTX of imports) {
      const dep = await this.require(importCTX);
      if (dep) await dep.resolve();
    }
  }
  /**
   *
   * @returns a map of all the documents used in the graph,
   */
  getMapDocument(): typeof ExiumGrapherModel['mapFiles'] {
    return ExiumGrapherModel.mapFiles;
  }
}

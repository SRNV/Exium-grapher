import {
  ExiumContext,
  ExiumDocument,
  ContextTypes,
} from '../deps/exium.ts';
import { join, normalize } from '../deps/path.ts';
import { ExiumGrapherOptions } from "./types/ExiumGrapherOptions.ts";

const importContextTypes = [ContextTypes.ImportStatement, ContextTypes.ImportAmbient];
export interface ExiumGrapherModelInterface {
  url: URL;
  document: ExiumDocument;
  fileDependencies: ExiumGrapherModel[];
}
export interface ExiumGrapherModelOptions {
  reader: (url: URL, onError: ExiumGrapherOptions['onError']) => Promise<string>,
  url: URL,
  source: string,
  cwd: ReturnType<typeof Deno['cwd']>;
  parent?: ExiumGrapherModel;
  onError: ExiumGrapherOptions['onError'];
  data: {
    isDeeper: boolean;
    isScript: boolean;
  }
}
export class ExiumGrapherModel implements ExiumGrapherModelInterface {
  /**
   * save all files, retrieve them with the path
   */
  static mapFiles: Map<string, ExiumGrapherModel> = new Map();
  baseURL: null | string = null;
  fileDependencies: ExiumGrapherModelInterface['fileDependencies'] = [];
  document: ExiumDocument;
  data: ExiumGrapherModelOptions['data'];
  onError: ExiumGrapherOptions['onError'];
  constructor(private opts: ExiumGrapherModelOptions) {
    this.data = opts.data;
    this.onError = opts.onError;
    this.document = new ExiumDocument({
      url: opts.url,
      onError() { },
      source: opts.source,
      options: {
        type: opts.data.isDeeper ?
          'deeper' :
          opts.data.isScript ?
            'script' :
            'custom',
      },
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
      const source = await this.reader(newurl, this.onError);
      const { pathname } = newurl;
      const isScript = pathname.endsWith('.js') ||
        pathname.endsWith('.jsx') ||
        pathname.endsWith('.ts') ||
        pathname.endsWith('.tsx');
      const isDeeper = pathname.endsWith('.deeper');
      const dependency = new ExiumGrapherModel({
        url: newurl,
        cwd: this.opts.cwd,
        reader: this.opts.reader,
        parent: this,
        source,
        onError: this.onError,
        data: {
          isDeeper,
          isScript,
        }
      });
      this.fileDependencies.push(dependency);
      return dependency;
    } else {
      throw invalid;
    }
  }
  setBaseURL() {
    if (!this.url.search) return;
    const urlsearch = new URLSearchParams(this.url.search);
    // save and remove the @ key
    this.baseURL = urlsearch.get('@');
    urlsearch.delete('@');
    this.url.search = `/${urlsearch.toString().replace(/^\/+/, '')}`;
  }
  getURL(path: string): URL {
    // first set the baseURL if there's any search param
    this.setBaseURL();
    // start to compute the url
    const isHTTP = path.startsWith('http://') || path.startsWith('https://');
    if (isHTTP) return new URL(path);
    const { isRemote } = this;
    const isRelative = path.startsWith('.');
    const isScoped = path.startsWith('@/');
    const reg = /^\@\//i;
    const finalPath = isRemote && isRelative && this.baseURL ?
      `${this.url.origin}/${join(this.baseURL, path)}` :
      isRemote && this.baseURL ?
        join(this.url.origin, this.baseURL, path.replace(reg, './')) :
        isScoped ?
          normalize(path.replace(reg, `file:///${this.opts.cwd.replace(/\/+$/, '')}/`)) :
          normalize(path);
    return isRelative ?
      new URL(finalPath, this.opts.url)
      : new URL(finalPath);
  }
  async resolve() {
    const { document } = this;
    const { contexts } = document;
    // TODO support for js/ts files
    const imports = contexts.filter((context: ExiumContext) => importContextTypes.includes(context.type));
    for await (const importCTX of imports) {
      const dep = await this.require(importCTX);
      if (dep) {
        dep.baseURL = this.baseURL;
        await dep.resolve();
      }
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

import {
  ExiumContext,
  ExiumDocument,
  ContextTypes,
} from '../../deps/exium.ts';

export interface ExiumGrapherModelInterface {
  url: URL;
  document: ExiumDocument;
  fileDependencies: ExiumGrapherModel[];
}
export interface ExiumGrapherModelOptions {
  reader: (url: URL, isRemote: boolean) => Promise<string>,
  url: URL,
  source: string,
  cwd: ReturnType<typeof Deno['cwd']>;
}
export class ExiumGrapherModel implements ExiumGrapherModelInterface {
  /**
   * save all files, retrieve them with the path
   */
  static mapFiles: Map<string, ExiumGrapherModel> = new Map();
  fileDependencies: ExiumGrapherModelInterface['fileDependencies'] = [];
  document: ExiumDocument;
  constructor(private opts: ExiumGrapherModelOptions) {
    this.document = new ExiumDocument({
      url: opts.url,
      onError() {},
      source: opts.source,
      options: { type: 'deeper' },
    });
    ExiumGrapherModel.mapFiles.set(opts.url.pathname, this);
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
      const isRemote = path.startsWith('https://') || path.startsWith('http://');
      const source = await this.reader(newurl, isRemote);
      const dependency = new ExiumGrapherModel({
        url: newurl,
        cwd: this.opts.cwd,
        reader: this.opts.reader,
        source,
      });
      this.fileDependencies.push(dependency);
      return dependency;
    } else {
      throw invalid;
    }
  }
  getURL(path: string): URL {
    const isRelative = path.startsWith('.');
    const isScoped = path.startsWith('@/');
    let finalPath = isScoped ? path.replace(/^\@\//i, `file:///${
      this.opts.cwd.replace(/\/+$/, '')
    }/`) : path;
    return isRelative ?
      new URL(finalPath, this.opts.url)
      : new URL(finalPath);
  }
  async resolve() {
    const { document } = this;
    const { contexts } = document;
    const imports = contexts.filter((context: ExiumContext) => context.type === ContextTypes.ImportStatement && context.data.isComponent)
    for await(let importCTX of imports) {
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

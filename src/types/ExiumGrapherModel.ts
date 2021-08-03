import {
  ExiumContext,
  ExiumDocument,
} from '../../deps/exium.ts';

export interface ExiumGrapherModelInterface {
  url: URL;
  document: ExiumDocument;
  fileDependencies: [ExiumGrapherModel, ExiumDocument][];
}
export class ExiumGrapherModel implements ExiumGrapherModelInterface {
  /**
   * save all files, retrieve them with the path
   */
  static mapFiles: Map<string, ExiumGrapherModel> = new Map();
  fileDependencies: ExiumGrapherModelInterface['fileDependencies'] = [];
  document: ExiumDocument;
  constructor(public url: URL, public reader: (url: URL) => string) {
    this.document = new ExiumDocument({});
  }
  /**
   * require a dependency and start saving this dependency
   * @param importCTX ExiumContext: ImportStatement
   */
  require(importCTX: ExiumContext) {
    const path = importCTX.getPath();
    const newurl = new URL(path, this.url);
    const dependency = new ExiumGrapherModel(newurl, this.reader);
    this.fileDependencies.push([dependency, importCTX]);
  }
  resolve() {

  }
}

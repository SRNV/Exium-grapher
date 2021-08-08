import { ExiumGrapherModelOptions } from "../ExiumGrapherModel.ts";
import { Reason } from '../../deps/exium.ts';

export interface ExiumGrapherOptions {
  // root file to start the modelisation
  url: URL;
  cwd?: ReturnType<typeof Deno['cwd']>;
  reader: ExiumGrapherModelOptions['reader'];
  onError(reason: Reason): void;
}

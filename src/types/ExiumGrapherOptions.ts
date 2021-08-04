import { ExiumGrapherModelOptions } from "../ExiumGrapherModel.ts";

export interface ExiumGrapherOptions {
  // root file to start the modelisation
  url: URL;
  cwd?: ReturnType<typeof Deno['cwd']>;
  reader: ExiumGrapherModelOptions['reader'];
}

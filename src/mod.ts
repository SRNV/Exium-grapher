import { ExiumGrapherModel } from "./types/ExiumGrapherModel.ts";
import { ExiumGrapherOptions } from "./types/ExiumGrapherOptions.ts";

export function compute(opts: ExiumGrapherOptions): ExiumGrapherModel {
  const model = new ExiumGrapherModel(opts.url, (fileURL: URL) => Deno.readTextFileSync(fileURL));
  return model;
}
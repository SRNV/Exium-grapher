import { ExiumGrapherModel } from "./types/ExiumGrapherModel.ts";
import { ExiumGrapherOptions } from "./types/ExiumGrapherOptions.ts";

export function compute(opts: ExiumGrapherOptions): ExiumGrapherModel {
  const model = new ExiumGrapherModel({
    url: opts.url,
    reader: async (fileURL: URL, isRemote: boolean) => {
      if (isRemote) {
        return await (await (await fetch(fileURL)).blob()).text();
      } else {
        return Deno.readTextFileSync(fileURL)
      }
    },
    cwd: opts.cwd || Deno.cwd(),
    source: Deno.readTextFileSync(opts.url),
  });
  return model;
}
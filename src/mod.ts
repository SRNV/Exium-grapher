import { ExiumGrapherModel } from "./types/ExiumGrapherModel.ts";
import { ExiumGrapherOptions } from "./types/ExiumGrapherOptions.ts";

export async function compute(opts: ExiumGrapherOptions): Promise<ExiumGrapherModel> {
  const reader = async (fileURL: URL) => {
    if (['http:', 'https:'].includes(fileURL.protocol)) {
      return await (await (await fetch(fileURL)).blob()).text();
    } else {
      return Deno.readTextFileSync(fileURL)
    }
  };
  const model = new ExiumGrapherModel({
    url: opts.url,
    reader,
    cwd: opts.cwd || Deno.cwd(),
    source: await reader(opts.url),
  });
  return model;
}
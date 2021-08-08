import { ExiumGrapherModel } from "./ExiumGrapherModel.ts";
import { ExiumGrapherOptions } from "./types/ExiumGrapherOptions.ts";
import reader from './reader.ts';

export async function compute(opts: ExiumGrapherOptions): Promise<ExiumGrapherModel> {
  if (['http:', 'https:'].includes(opts.url.protocol)) throw new Error(`The component at the root cannot be a remote component. input: ${opts.url.href}`)
  const model = new ExiumGrapherModel({
    url: opts.url,
    reader: opts.reader,
    cwd: opts.cwd || Deno.cwd(),
    source: await reader(opts.url),
    data: {
      isDeeper: opts.url.pathname.endsWith('.deeper'),
      isScript: false,
    }
  });
  return model;
}
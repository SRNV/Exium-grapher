import { existsSync } from '../deps/fs.ts'
import { ExiumGrapherOptions } from './types/ExiumGrapherOptions.ts';

  export default async (fileURL: URL, onError: ExiumGrapherOptions['onError']) => {
  if (['http:', 'https:'].includes(fileURL.protocol)) {
    return await (await (await fetch(fileURL)).blob()).text();
  } else {
    if (!existsSync(fileURL.pathname)) throw new Error('[Exium-grapher] file not found.');
    return Deno.readTextFileSync(fileURL)
  }
};
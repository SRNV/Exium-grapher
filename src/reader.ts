import { ExiumGrapherOptions } from './types/ExiumGrapherOptions.ts';
import { Reason } from '../deps/exium.ts';

export default async (fileURL: URL, onError: ExiumGrapherOptions['onError']) => {
  if (['http:', 'https:'].includes(fileURL.protocol)) {
    const result = await fetch(fileURL);
    if (result.status >= 400) {
      onError({
        data: {
          url: fileURL,
        },
        reason: Reason.ComponentNotFound,
      });
    }
    return await (await result.blob()).text();
  } else {
    try {
      return Deno.readTextFileSync(fileURL);
    } catch(err) {
      onError({
        data: {
          url: fileURL,
        },
        reason: Reason.ComponentNotFound,
      });
      throw err;
    }
  }
};
import { compute } from '../src/mod.ts';
import {
  assert,
} from "https://deno.land/std@0.95.0/testing/asserts.ts";
import { ExiumGrapherModel } from "../src/ExiumGrapherModel.ts";
import reader from "../src/reader.ts";

Deno.test('exium-grapher - absolute path resolution', async () => {
  try {
    const url = new URL('./fixtures/absolute_test/A.deeper', import.meta.url);
    const cwd = new URL('./fixtures/absolute_test/', import.meta.url);
    const graph = await compute({
      url,
      reader,
      cwd: cwd.pathname,
      onError() {
        throw new Error('test failed because of an error');
      },
    });
    await graph.resolve();
    const map = graph.getMapDocument();
    const keys = Array.from(map.keys());
    assert(keys.length === 2);
    map.forEach((model: ExiumGrapherModel) => {
      const { document } = model;
      const componentA = document.getComponentByName('A');
      const componentB = document.getComponentByName('B');
      if (model.url.pathname.endsWith('A.deeper')) assert(componentA);
      if (model.url.pathname.endsWith('B.deeper')) assert(componentB);
    });
  } catch (err) {
    throw err;
  }
});
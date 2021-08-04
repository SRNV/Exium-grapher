import { compute } from '../src/mod.ts';
import {
  assert,
  assertEquals,
} from "https://deno.land/std@0.95.0/testing/asserts.ts";
import { ExiumGrapherModel } from "../src/ExiumGrapherModel.ts";
import reader from '../src/reader.ts';

Deno.test('exium-grapher - resolve remote components', async () => {
  try {
    const url = new URL('./fixtures/remote_test/A.deeper', import.meta.url);
    const graph = await compute({
      url,
      reader,
    });
    await graph.resolve();
    const map = graph.getMapDocument();
    const keys = Array.from(map.keys());
    assertEquals(keys.length, 3);
    map.forEach((model: ExiumGrapherModel) => {
      const { document } = model;
      const componentA = document.getComponentByName('A');
      const componentB = document.getComponentByName('B');
      if (model.url.pathname.endsWith('A.deeper')) assert(componentA);
      if (model.url.pathname.endsWith('B.deeper')) {
        console.warn(model);
        assert(componentB);
      }
    });
  } catch (err) {
    throw err;
  }
});
import { compute } from '../src/mod.ts';
import {
  assert,
  assertStrictEquals
} from "https://deno.land/std@0.95.0/testing/asserts.ts";
import { ExiumGrapherModel } from "../src/ExiumGrapherModel.ts";
import reader from '../src/reader.ts';

Deno.test('exium-grapher - graph resolution', async () => {
  try {
    const url = new URL('./fixtures/graph_test/Hello.deeper', import.meta.url);
    const graph = await compute({
      url,
      reader,
      onError() {
        throw new Error('test failed because of an error');
      },
    });
    await graph.resolve();
    const map = graph.getMapDocument();
    const keys = Array.from(map.keys());
    assert(keys.length === 3);
    map.forEach((model: ExiumGrapherModel) => {
      const { document } = model;
      assertStrictEquals(document.url, model.url);
    });
  } catch (err) {
    throw err;
  }
});
import { compute } from '../src/mod.ts';
import {
  assert,
  assertStrictEquals
} from "https://deno.land/std@0.95.0/testing/asserts.ts";
import { ExiumGrapherModel } from "../src/ExiumGrapherModel.ts";
import reader from '../src/reader.ts';

Deno.test('exium-grapher - can resolve module path', async () => {
  try {
    const url = new URL('./fixtures/module_test/C.bio', import.meta.url);
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
    assertStrictEquals(keys.length, 4);
  } catch (err) {
    throw err;
  }
});
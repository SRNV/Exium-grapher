import { compute } from '../src/mod.ts';
import {
  assert,
} from "https://deno.land/std@0.95.0/testing/asserts.ts";
import { ExiumGrapherModel } from "../src/types/ExiumGrapherModel.ts";

Deno.test('exium-grapher - resolve remote components', async () => {
  try {
    const url = new URL('https://raw.githubusercontent.com/SRNV/Exium-grapher/main/tests/fixtures/remove_test/A.deeper');
    const graph = await compute({
      url,
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
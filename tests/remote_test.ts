import { compute } from '../src/mod.ts';
import {
  assert,
  assertEquals,
} from "https://deno.land/std@0.95.0/testing/asserts.ts";
import { ExiumGrapherModel } from "../src/ExiumGrapherModel.ts";
import reader from '../src/reader.ts';
import { Reason } from '../deps/exium.ts';

Deno.test('exium-grapher - resolve remote components', async () => {
  try {
    const url = new URL('./fixtures/remote_test/A.deeper', import.meta.url);
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
    assertEquals(keys.length, 3);
    map.forEach((model: ExiumGrapherModel) => {
      const { document } = model;
      const componentA = document.getComponentByName('A');
      const componentB = document.getComponentByName('B');
      const componentC = document.getComponentByName('C');
      if (model.url.pathname.endsWith('A.deeper')) assert(componentA);
      if (model.url.pathname.endsWith('B.deeper')) assert(componentB);
      if (model.url.pathname.endsWith('C.deeper')) assert(componentC);
    });
  } catch (err) {
    throw err;
  }
});

Deno.test('exium-grapher - resolve remote components with multiple sub relative imports', async () => {
  try {
    const url = new URL('./fixtures/remote_test/A2.deeper', import.meta.url);
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
    assertEquals(keys.length, 7);
    map.forEach((model: ExiumGrapherModel) => {
      const { document } = model;
      const components = document.getExportedComponents();
      assertEquals(components.length, 1);
    });
  } catch (err) {
    throw err;
  }
});

Deno.test('exium-grapher - throws if the request to a component results to a 404 not found', async () => {
  try {
    let isSuccess = false;
    const url = new URL('./fixtures/remote_test/A2.deeper', import.meta.url);
    const graph = await compute({
      url,
      reader,
      onError(reason) {
        isSuccess = reason === Reason.ComponentNotFound;
      },
    });
    await graph.resolve();
    assert(isSuccess);
  } catch (err) {
    throw err;
  }
});
import { compute } from '../src/mod.ts';
import {
  assert,
  // assertStrictEquals
} from "https://deno.land/std@0.95.0/testing/asserts.ts";
// import { ExiumGrapherModel } from "../src/ExiumGrapherModel.ts";
import reader from '../src/reader.ts';

const url = new URL('./fixtures/graph_test/Hello.bio', import.meta.url);
const url2 = new URL('./fixtures/graph_test/SubChild.bio', import.meta.url);
const graph = await compute({
  url,
  reader,
  onError() {
    throw new Error('test failed because of an error');
  },
});
const graph2 = await compute({
  url,
  reader,
  onError() {
    throw new Error('test failed because of an error');
  },
});
// different
const graph3 = await compute({
  url: url2,
  reader,
  onError() {
    throw new Error('test failed because of an error');
  },
});
Deno.test('exium-grapher - graph.isEqual(...) returns true when the documents are the same', async () => {
  try {
    await graph.resolve();
    await graph2.resolve();
    const isEqual = graph.isEqual(graph2);
    assert(isEqual);
  } catch (err) {
    throw err;
  }
});

Deno.test('exium-grapher - graph.isEqual(...) returns false when the documents are different', async () => {
  try {
    await graph.resolve();
    await graph3.resolve();
    const isEqual = graph.isEqual(graph3);
    assert(!isEqual);
  } catch (err) {
    throw err;
  }
});
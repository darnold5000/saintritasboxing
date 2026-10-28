import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { SITE_INDEXABLE, localBusinessSchema } from "./seo";

describe("seo", () => {
  it("opts this site in for indexing", () => {
    assert.equal(SITE_INDEXABLE, true);
  });

  it("describes the Mooresville boxing location", () => {
    const schema = localBusinessSchema();
    assert.equal(schema.address.addressLocality, "Mooresville");
    assert.match(schema.description, /boxing/i);
  });
});

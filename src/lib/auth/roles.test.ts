import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { canViewFinancials } from "./roles";

describe("staff roles", () => {
  it("lets only an owner see financials", () => {
    assert.equal(canViewFinancials("owner"), true);
    assert.equal(canViewFinancials("staff"), false);
    assert.equal(canViewFinancials("admin"), false);
    assert.equal(canViewFinancials(null), false);
  });
});

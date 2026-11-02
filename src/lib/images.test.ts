import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { imageKind } from "./images";

describe("image uploads", () => {
  it("accepts jpeg, png, and webp signatures", () => {
    const jpeg = new Uint8Array(12);
    jpeg.set([0xff, 0xd8, 0xff], 0);
    const png = new Uint8Array(12);
    png.set([0x89, 0x50, 0x4e, 0x47], 0);
    const webp = new Uint8Array(12);
    webp.set([0x52, 0x49, 0x46, 0x46], 0);
    webp.set([0x57, 0x45, 0x42, 0x50], 8);
    assert.equal(imageKind(jpeg), "jpg");
    assert.equal(imageKind(png), "png");
    assert.equal(imageKind(webp), "webp");
  });

  it("rejects other files", () => {
    const text = new Uint8Array(12);
    text.set([0x3c, 0x73, 0x76, 0x67], 0);
    assert.equal(imageKind(text), null);
    assert.equal(imageKind(new Uint8Array([0xff, 0xd8])), null);
  });
});

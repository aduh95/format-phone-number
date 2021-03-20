#!/usr/bin/env node

import format from "@aduh95/format-phone-number";

import assert from "node:assert";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const data = require("./data.json");

for (const { e164, expected } of data) {
  assert.strictEqual(await format(e164), expected);
}

assert.strictEqual(await format("+19788899934"), "+1 978-889-9934");

console.log("Passed");

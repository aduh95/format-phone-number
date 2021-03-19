#!/usr/bin/env node

import format from "@aduh95/format-phone-number";

import assert from "node:assert";

assert.strictEqual(await format("+33498281534"), "+33 4 98 28 15 34");
assert.strictEqual(await format("+19788899934"), "+1 978-889-9934");

console.log("Passed");

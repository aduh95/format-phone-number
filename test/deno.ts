#!/usr/bin/env deno

/// @deno-types="@aduh95/format-phone-number/types"
import format from "@aduh95/format-phone-number";

import { assertStrictEquals } from "std::testing";

Deno.test({
  name: "unit test",
  async fn() {
    assertStrictEquals(await format("+33498281534"), "+33 4 98 28 15 34");
    assertStrictEquals(await format("+19788899934"), "+1 978-889-9934");
  },
});

#!/usr/bin/env node

import assert from "node:assert";
import http from "node:http";
import { createReadStream, existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import puppeteer from "puppeteer";

const PROJECT_ROOT = new URL("../", import.meta.url);

const devtools = false;

async function generateImportMap() {
  const packageInfo = await readFile(new URL("./package.json", PROJECT_ROOT));
  const { name, exports } = JSON.parse(packageInfo);
  const imports = {};
  for (const [key, value] of Object.entries(exports)) {
    imports[key.replace(/^\./, name)] = value.default || value;
  }
  return { imports };
}

const server = http.createServer((req, res) => {
  try {
    if (req.url === "/") {
      res.setHeader("Content-Type", "text/html");
      res.write(`<html><head><script type="importmap">`);
      generateImportMap().then((importMap) => {
        res.write(JSON.stringify(importMap));
        res.end("</script></head></html>");
      });
    } else {
      const requestedFile = new URL(`.${req.url}`, PROJECT_ROOT);
      if (existsSync(requestedFile)) {
        if (req.url.endsWith(".js"))
          res.setHeader("Content-Type", "application/javascript");
        createReadStream(requestedFile).pipe(res);
        console.log(200, req.url);
      } else {
        res.statusCode = 404;
        res.end(`Cannot find '${req.url}' on this server.`);
        console.log(404, req.url);
      }
    }
  } catch (e) {
    console.error(e);
    res.statusCode = 500;
    res.end("Internal Error");
  }
});

let browser;
try {
  let port;
  [browser, port] = await Promise.all([
    puppeteer.launch({ devtools }),

    new Promise((resolve) => {
      server.listen(() => {
        resolve(server.address().port);
      });
    }),
  ]);
  const page = await browser.newPage();
  await page.goto(`http://localhost:${port}/`);

  await page.evaluate(function () {
    globalThis.format = (str) =>
      import("@aduh95/format-phone-number").then((m) => m.default(str));
  });
  const format = (s) => globalThis.format(s);

  assert.strictEqual(
    await page.evaluate(format, "+33498281534"),
    "+33 4 98 28 15 34"
  );
  assert.strictEqual(
    await page.evaluate(format, "+19788899934"),
    "+1 978-889-9934"
  );
  console.log("Passed");
} catch (e) {
  if (devtools) console.error(e);
  else throw e;
} finally {
  if (!devtools) {
    await browser.close();
    await new Promise((d) => server.close(d));
  }
}

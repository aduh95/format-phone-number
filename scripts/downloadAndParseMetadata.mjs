#!/usr/bin/env node

// Usage: ./parseXML.mjs "https://github.com/google/libphonenumber/raw/master/resources/PhoneNumberMetadata.xml" ./data/

import process from "node:process";
import http from "node:http";
import https from "node:https";
import { createReadStream } from "node:fs";
import { mkdir, stat, writeFile } from "node:fs/promises";
import { pathToFileURL } from "node:url";

import puppeteer from "puppeteer";

const SOURCE_URL = /^https?:\/\//.test(process.argv[2])
  ? new URL(process.argv[2])
  : pathToFileURL(process.argv[2]);
const OUTPUT_DIR = pathToFileURL(process.argv[3]);

const devtools = false; // set it to true to debug

if (
  await stat(OUTPUT_DIR).then(
    (d) =>
      d.isDirectory()
        ? false
        : Promise.reject(new Error(`${OUTPUT_DIR} is not a directory.`)),
    () => true
  )
)
  await mkdir(OUTPUT_DIR);

async function downloadAndParseXML(sourceURL) {
  const xml = await fetch(sourceURL).then((r) => r.text());
  const document = new DOMParser().parseFromString(xml, "application/xml");
  return Array.from(document.querySelectorAll("territory"), (territory) => [
    territory.getAttribute("countryCode"),
    Array.from(
      territory
        .querySelector("availableFormats")
        ?.querySelectorAll("numberFormat") ?? [],
      (numberFormat) => ({
        leadingDigits: numberFormat
          .querySelector("leadingDigits")
          ?.textContent.replace(/\s/g, ""),
        format: (
          numberFormat.querySelector("intlFormat") ??
          numberFormat.querySelector("format")
        )?.textContent,
        pattern: numberFormat.getAttribute("pattern"),
      })
    ).filter(({ format }) => format && format !== "NA"),
  ]).filter((c) => c[1].length);
}

function fetch(url) {
  console.error("fetch", url);
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      const statusFamily = Math.floor(res.statusCode / 100);
      if (statusFamily === 2) {
        resolve(res);
      } else if (statusFamily === 3) {
        fetch(res.rawHeaders[res.rawHeaders.indexOf("Location") + 1]).then(
          resolve,
          reject
        );
      } else {
        reject(res);
      }
    });
  });
}

const server = http.createServer((req, res) => {
  // Mini-proxy
  res.setHeader("Content-Type", "application/xml");
  res.setHeader("Access-Control-Allow-Origin", "*");
  if (SOURCE_URL.protocol === "https:") {
    fetch(SOURCE_URL)
      .then((result) => result.pipe(res))
      .catch(console.error);
  } else {
    createReadStream(SOURCE_URL).pipe(res);
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

  if (devtools) await new Promise((d) => setTimeout(d, 2000));

  const data = await page.evaluate(
    downloadAndParseXML,
    `http://localhost:${port}/`
  );
  process.stdout.write("export default[");
  await Promise.all(
    data.map(
      ([countryCode, data]) => (
        process.stdout.write(countryCode + ","),
        writeFile(
          new URL(`./${countryCode}.json`, OUTPUT_DIR),
          JSON.stringify(data)
        )
      )
    )
  );
  process.stdout.write("];\n");
} catch (e) {
  console.error(e);
} finally {
  if (!devtools) await browser.close();
  await new Promise((d) => server.close(d));
}

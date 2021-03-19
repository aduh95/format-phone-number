import { readFile } from "node:fs/promises";
const dataFolder = new URL("./data/", import.meta.url);

export default (countryCode) =>
  readFile(new URL(`./${countryCode}.json`, dataFolder)).then(JSON.parse);

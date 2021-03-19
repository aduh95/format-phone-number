const dataFolder = new URL("./data/", import.meta.url);

export default (countryCode) =>
  Deno.readTextFile(new URL(`./${countryCode}.json`, dataFolder)).then(
    JSON.parse
  );

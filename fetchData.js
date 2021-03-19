const dataFolder = new URL("./data/", import.meta.url);

export default (countryCode) =>
  fetch(new URL(`./${countryCode}.json`, dataFolder)).then((r) =>
    r.ok ? r.json() : Promise.reject(new Error(r.statusText))
  );

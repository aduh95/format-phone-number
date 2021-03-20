import countryCodes from "./countryCodes.js";
import getCountryData from "@aduh95/format-phone-number/getCountryData";

async function getInfo(phoneNumber) {
  const start = phoneNumber[0] === "+" ? 1 : 0;
  for (let i = start; i < phoneNumber.length; i++) {
    const countryCode = Number(phoneNumber.slice(start, i));
    if (countryCodes.includes(countryCode)) {
      return [
        countryCode,
        phoneNumber.slice(i),
        await getCountryData(countryCode),
      ];
    }
  }
  return Promise.reject(new Error("Unable to find valid country code"));
}

export default async function format(phoneNumber) {
  const [countryCode, national, data] = await getInfo(phoneNumber);

  let formattedNational;
  for (const { leadingDigits, pattern, format } of data) {
    if (new RegExp(`^(${leadingDigits})`).test(national)) {
      const patternRegex = new RegExp(`${pattern}$`);
      if (patternRegex.test(national)) {
        formattedNational = national.replace(patternRegex, format);
        break;
      }
    }
  }

  return `+${countryCode} ${formattedNational || national}`;
}

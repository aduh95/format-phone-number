# @aduh95/format-phone-number

Simple JavaScript library that takes a phone number in the E164 format and
returns it in an international format. It's using Google's
[libphonenumber](https://github.com/google/libphonenumber) as a source of truth
for how to format a phone number.

## Usage

```sh
npm install @aduh95/format-phone-number

# or if you're using yarn
yarn add @aduh95/format-phone-number
```

```js
import format from "@aduh95/format-phone-number";

await format("+16135991209"); // +1 613-599-1209

// You can omit the leading `+`
await format("16135991209"); // +1 613-599-1209
```

Ensure that the phone number is valid and includes the country code, otherwise
you'll get undefined behavior.

## Build

```sh
yarn install
yarn build
yarn test
```

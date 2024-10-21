import { type Format, formats, imageNumberOptionKeys, imageOptionKeys, type ImageOptions } from './constants.ts';
export function getOptionsMap(optionsString: string): ImageOptions {
  const res = {};
  if (!optionsString) {
    return res;
  }

  const arr = optionsString.split(',').map((str) => str.split('='));

  for (const key of imageOptionKeys) {
    const target = arr.find((op) => op[0] === key);
    if (target?.[1]) {
      let value: number | string | undefined;
      if (imageNumberOptionKeys.includes(key)) {
        try {
          value = Number(target[1]) || undefined;
        } catch (_e) {
          value = undefined;
        }
      } else {
        // format
        value = formats.includes(target[1] as Format) ? target[1] : undefined;
      }

      Object.assign(res, { [key]: value });
    }
  }

  return res;
}

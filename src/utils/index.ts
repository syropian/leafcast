import tinycolor from "tinycolor2";
import { HslWithName } from "../types";

export function createHslColorWithName(color: tinycolor.ColorFormats.HSL): HslWithName {
  const colorObj = tinycolor(color);
  const colorName = colorObj.toName() || colorObj.toHexString();

  const hslColorWithName: HslWithName = {
    hsl: color,
    name: colorName,
  };

  return hslColorWithName;
}

export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

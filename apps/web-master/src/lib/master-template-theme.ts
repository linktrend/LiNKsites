import theme from "../../config/theme.json";
import {
  assertThemeContractCss,
  renderThemeContractCss,
} from "@linksites/factory-catalog/master-template-tokens";

/**
 * Apply authored theme.json into web-master CSS / data-theme.
 * Never reads or overlays generated tokens.css, tokens.json, or variants.json.
 */
export function getMasterTemplateThemeContractCss(): string {
  const css = renderThemeContractCss(theme);
  assertThemeContractCss(css);
  return css;
}

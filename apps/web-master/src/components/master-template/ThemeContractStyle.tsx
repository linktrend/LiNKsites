import { getMasterTemplateThemeContractCss } from "@/lib/master-template-theme";

/**
 * Injects CSS variables from authored theme.json onto data-theme selectors.
 * This is not a tokens.css / tokens.json / variants.json overlay.
 */
export function ThemeContractStyle() {
  return (
    <style
      data-theme-contract="theme.json"
      dangerouslySetInnerHTML={{ __html: getMasterTemplateThemeContractCss() }}
    />
  );
}

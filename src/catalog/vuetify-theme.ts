import { z } from 'zod';

/**
 * Zod schema describing the theme properties supported by the Vuetify renderer.
 *
 * Colors are mapped to Vuetify's dynamic theme system in A2UIProvider:
 *   primaryColor    → Vuetify "primary"
 *   errorColor      → Vuetify "error"
 *   backgroundColor → Vuetify "background"
 *   surfaceColor    → Vuetify "surface"
 *
 * agentDisplayName and iconUrl are protocol-standard fields that host apps
 * can read from the surface theme for branding (e.g. chat headers).
 */
export const VUETIFY_THEME_SCHEMA = z.object({
  primaryColor: z
    .string()
    .describe('Primary brand color applied to buttons, links, and accents.')
    .optional(),
  errorColor: z
    .string()
    .describe('Color used for error states and validation messages.')
    .optional(),
  backgroundColor: z
    .string()
    .describe('Page or surface background color.')
    .optional(),
  surfaceColor: z
    .string()
    .describe('Color for elevated surfaces such as cards and dialogs.')
    .optional(),
  agentDisplayName: z
    .string()
    .describe('Human-readable name of the agent, for display in headers or attribution.')
    .optional(),
  iconUrl: z
    .string()
    .describe('URL to the agent icon or avatar image.')
    .optional(),
});

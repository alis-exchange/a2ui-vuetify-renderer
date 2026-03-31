import { BASIC_FUNCTIONS } from '@a2ui/web_core/v0_9/basic_catalog';
import type { FunctionImplementation } from '@a2ui/web_core/v0_9';

/**
 * The Vuetify catalog currently delegates to the basic catalog functions
 * (required, regex, email, formatString, openUrl, etc.).
 * Vuetify-specific functions can be appended here in the future.
 */
export const VUETIFY_FUNCTIONS: FunctionImplementation[] = [...BASIC_FUNCTIONS];

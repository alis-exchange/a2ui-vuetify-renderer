import * as V09 from '@a2ui/web_core/v0_9';
import * as V10 from '@a2ui/web_core/v1_0';
import { z } from 'zod';

/**
 * The web_core building blocks a component schema needs, for one A2UI protocol family.
 *
 * Component APIs are written once as `(kit) => ComponentApi` builders and built per kit, so the
 * same Vue component validates v0.9 messages (`{ path }`, `{ call }`) and v1.0 messages
 * (`{ "@path" }`, `{ "@call" }`) without a second copy. v0.9.1 uses the v0.9 kit.
 *
 * web_core exports these schemas under the same names in `/v0_9` and `/v1_0`; the fields are typed
 * as the v0.9 shapes so builders read the same either way. Only the wire format differs.
 */
export interface ProtocolKit {
  /** Protocol family, as A2UI message envelopes spell it. */
  readonly version: 'v0.9' | 'v1.0';
  /** `protocolVersion` of a catalog built with this kit. */
  readonly catalogVersion: '0.9' | '1.0';
  readonly ActionSchema: typeof V09.ActionSchema;
  readonly CheckableSchema: typeof V09.CheckableSchema;
  readonly ChildListSchema: typeof V09.ChildListSchema;
  /** A single child reference. v1.0 calls it `Child`; both are a ComponentId. */
  readonly ComponentIdSchema: typeof V09.ComponentIdSchema;
  readonly DynamicBooleanSchema: typeof V09.DynamicBooleanSchema;
  readonly DynamicNumberSchema: typeof V09.DynamicNumberSchema;
  readonly DynamicStringSchema: typeof V09.DynamicStringSchema;
  readonly DynamicValueSchema: typeof V09.DynamicValueSchema;
  /**
   * A bare data binding for props that accept a literal or a binding but not a function call
   * (Icon `name`, RangeSlider `value`): `{ path }` on v0.9, `{ "@path" }` on v1.0.
   */
  readonly PathBinding: z.ZodTypeAny;
  /** Props every component accepts on top of its own. */
  readonly commonProps: Readonly<Record<string, z.ZodTypeAny>>;
}

const weight = z.number().describe("The relative weight of this component within a Row or Column. Similar to CSS 'flex-grow'.").optional();

/** A2UI v0.9 and v0.9.1. */
export const A2UI_V09: ProtocolKit = Object.freeze({
  version: 'v0.9',
  catalogVersion: '0.9',
  ActionSchema: V09.ActionSchema,
  CheckableSchema: V09.CheckableSchema,
  ChildListSchema: V09.ChildListSchema,
  ComponentIdSchema: V09.ComponentIdSchema,
  DynamicBooleanSchema: V09.DynamicBooleanSchema,
  DynamicNumberSchema: V09.DynamicNumberSchema,
  DynamicStringSchema: V09.DynamicStringSchema,
  DynamicValueSchema: V09.DynamicValueSchema,
  // Kept as a hand-written object, not DataBindingSchema, so the published v0.9 catalog is unchanged.
  PathBinding: z.object({ path: z.string() }),
  commonProps: Object.freeze({ accessibility: V09.AccessibilityAttributesSchema.optional(), weight }),
});

/**
 * A2UI v1.0.
 *
 * `accessibility`, `catalogId` and `metadata` are envelope keys in v1.0: web_core accepts them on
 * any component without the catalog declaring them, and the spec says catalogs must not repeat
 * them. `weight` is not, so it stays a declared prop.
 */
export const A2UI_V10: ProtocolKit = Object.freeze({
  version: 'v1.0',
  catalogVersion: '1.0',
  ActionSchema: V10.ActionSchema as unknown as typeof V09.ActionSchema,
  CheckableSchema: V10.CheckableSchema as unknown as typeof V09.CheckableSchema,
  ChildListSchema: V10.ChildListSchema as unknown as typeof V09.ChildListSchema,
  ComponentIdSchema: V10.ChildSchema as unknown as typeof V09.ComponentIdSchema,
  DynamicBooleanSchema: V10.DynamicBooleanSchema as unknown as typeof V09.DynamicBooleanSchema,
  DynamicNumberSchema: V10.DynamicNumberSchema as unknown as typeof V09.DynamicNumberSchema,
  DynamicStringSchema: V10.DynamicStringSchema as unknown as typeof V09.DynamicStringSchema,
  DynamicValueSchema: V10.DynamicValueSchema as unknown as typeof V09.DynamicValueSchema,
  PathBinding: V10.DataBindingSchema,
  commonProps: Object.freeze({ weight }),
});

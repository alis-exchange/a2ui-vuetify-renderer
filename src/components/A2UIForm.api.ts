/**
 * ComponentApi schema for A2UIForm.
 * Extracted from the Vue SFC so catalog generation does not load .vue files under tsx.
 */
import { ChildListSchema, type ComponentApi } from '@a2ui/web_core/v0_9';
import { z } from 'zod';
import { CommonProps } from '../catalog/common-props';

export const FormApi: ComponentApi = {
  name: 'Form',
  schema: z
    .object({
      ...CommonProps,
      children: ChildListSchema,
    })
    .strict(),
};

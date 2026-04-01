import type { ComponentApi } from '@a2ui/web_core/v0_9';
import { AccessibilityAttributesSchema, ActionSchema, CheckableSchema, ChildListSchema, ComponentIdSchema, DynamicBooleanSchema, DynamicNumberSchema, DynamicStringSchema, DynamicValueSchema } from '@a2ui/web_core/v0_9';
import { z } from 'zod';

const CommonProps = {
  accessibility: AccessibilityAttributesSchema.optional(),
  weight: z.number().describe("The relative weight of this component within a Row or Column. Similar to CSS 'flex-grow'.").optional(),
};

// ---------------------------------------------------------------------------
// Content & Display
// ---------------------------------------------------------------------------

export const TextApi = {
  name: 'Text',
  schema: z
    .object({
      ...CommonProps,
      text: DynamicStringSchema,
      variant: z.enum(['h1', 'h2', 'h3', 'h4', 'h5', 'caption', 'body']).default('body').optional(),
    })
    .strict(),
} satisfies ComponentApi;

export const ImageApi = {
  name: 'Image',
  schema: z
    .object({
      ...CommonProps,
      url: DynamicStringSchema,
      description: DynamicStringSchema.optional(),
      fit: z.enum(['contain', 'cover', 'fill', 'none', 'scaleDown']).default('fill').optional(),
      variant: z.enum(['icon', 'avatar', 'smallFeature', 'mediumFeature', 'largeFeature', 'header']).default('mediumFeature').optional(),
    })
    .strict(),
} satisfies ComponentApi;

export const IconApi = {
  name: 'Icon',
  schema: z
    .object({
      ...CommonProps,
      name: z.union([z.string(), z.object({ path: z.string() })]),
    })
    .strict(),
} satisfies ComponentApi;

export const DividerApi = {
  name: 'Divider',
  schema: z
    .object({
      ...CommonProps,
      axis: z.enum(['horizontal', 'vertical']).default('horizontal').optional(),
    })
    .strict(),
} satisfies ComponentApi;

export const AvatarApi = {
  name: 'Avatar',
  schema: z
    .object({
      ...CommonProps,
      image: DynamicStringSchema.optional(),
      text: DynamicStringSchema.optional(),
      child: ComponentIdSchema.optional(),
    })
    .strict(),
} satisfies ComponentApi;

export const BadgeApi = {
  name: 'Badge',
  schema: z
    .object({
      ...CommonProps,
      content: DynamicStringSchema,
      color: z.string().optional(),
      child: ComponentIdSchema,
    })
    .strict(),
} satisfies ComponentApi;

export const ChipApi = {
  name: 'Chip',
  schema: z
    .object({
      ...CommonProps,
      text: DynamicStringSchema.optional(),
      child: ComponentIdSchema.optional(),
    })
    .strict(),
} satisfies ComponentApi;

export const AlertApi = {
  name: 'Alert',
  schema: z
    .object({
      ...CommonProps,
      title: DynamicStringSchema.optional(),
      text: DynamicStringSchema.optional(),
      variant: z.enum(['success', 'info', 'warning', 'error']).default('info').optional(),
      child: ComponentIdSchema.optional(),
    })
    .strict(),
} satisfies ComponentApi;

export const BannerApi = {
  name: 'Banner',
  schema: z
    .object({
      ...CommonProps,
      text: DynamicStringSchema,
      icon: DynamicStringSchema.optional(),
      child: ComponentIdSchema.optional(),
    })
    .strict(),
} satisfies ComponentApi;

export const EmptyStateApi = {
  name: 'EmptyState',
  schema: z
    .object({
      ...CommonProps,
      title: DynamicStringSchema.optional(),
      text: DynamicStringSchema.optional(),
      icon: DynamicStringSchema.optional(),
      child: ComponentIdSchema.optional(),
    })
    .strict(),
} satisfies ComponentApi;

export const RatingApi = {
  name: 'Rating',
  schema: z
    .object({
      ...CommonProps,
      max: z.number().default(5).optional(),
      value: DynamicNumberSchema,
      action: ActionSchema.optional(),
    })
    .strict(),
} satisfies ComponentApi;

// ---------------------------------------------------------------------------
// Layout & Containers
// ---------------------------------------------------------------------------

export const RowApi = {
  name: 'Row',
  schema: z
    .object({
      ...CommonProps,
      children: ChildListSchema,
      justify: z.enum(['center', 'end', 'spaceAround', 'spaceBetween', 'spaceEvenly', 'start', 'stretch']).default('start').optional(),
      align: z.enum(['start', 'center', 'end', 'stretch']).default('stretch').optional(),
    })
    .strict(),
} satisfies ComponentApi;

export const ColumnApi = {
  name: 'Column',
  schema: z
    .object({
      ...CommonProps,
      children: ChildListSchema,
      justify: z.enum(['start', 'center', 'end', 'spaceBetween', 'spaceAround', 'spaceEvenly', 'stretch']).default('start').optional(),
      align: z.enum(['center', 'end', 'start', 'stretch']).default('stretch').optional(),
    })
    .strict(),
} satisfies ComponentApi;

export const ListApi = {
  name: 'List',
  schema: z
    .object({
      ...CommonProps,
      children: ChildListSchema,
      direction: z.enum(['vertical', 'horizontal']).default('vertical').optional(),
      align: z.enum(['start', 'center', 'end', 'stretch']).default('stretch').optional(),
    })
    .strict(),
} satisfies ComponentApi;

export const CardApi = {
  name: 'Card',
  schema: z
    .object({
      ...CommonProps,
      child: ComponentIdSchema,
    })
    .strict(),
} satisfies ComponentApi;

export const TabsApi = {
  name: 'Tabs',
  schema: z
    .object({
      ...CommonProps,
      tabs: z
        .array(
          z
            .object({
              title: DynamicStringSchema,
              child: ComponentIdSchema,
            })
            .strict(),
        )
        .min(1),
      action: ActionSchema.optional(),
    })
    .strict(),
} satisfies ComponentApi;

export const ModalApi = {
  name: 'Modal',
  schema: z
    .object({
      ...CommonProps,
      trigger: ComponentIdSchema,
      content: ComponentIdSchema,
      open: DynamicBooleanSchema.optional(),
      action: ActionSchema.optional(),
    })
    .strict(),
} satisfies ComponentApi;

export const ExpansionPanelApi = {
  name: 'ExpansionPanel',
  schema: z
    .object({
      ...CommonProps,
      title: DynamicStringSchema,
      child: ComponentIdSchema,
      action: ActionSchema.optional(),
    })
    .strict(),
} satisfies ComponentApi;

export const FormApi = {
  name: 'Form',
  schema: z
    .object({
      ...CommonProps,
      children: ChildListSchema,
    })
    .strict(),
} satisfies ComponentApi;

// ---------------------------------------------------------------------------
// Interactive & Forms
// ---------------------------------------------------------------------------

export const ButtonApi = {
  name: 'Button',
  schema: z
    .object({
      ...CommonProps,
      child: ComponentIdSchema,
      variant: z.enum(['default', 'primary', 'borderless']).default('default').optional(),
      action: ActionSchema,
      checks: CheckableSchema.shape.checks,
    })
    .strict(),
} satisfies ComponentApi;

export const TextFieldApi = {
  name: 'TextField',
  schema: z
    .object({
      ...CommonProps,
      label: DynamicStringSchema,
      value: DynamicStringSchema.optional(),
      variant: z.enum(['filled', 'outlined', 'underlined']).default('outlined').optional(),
      action: ActionSchema.optional(),
      checks: CheckableSchema.shape.checks,
    })
    .strict(),
} satisfies ComponentApi;

export const TextAreaApi = {
  name: 'TextArea',
  schema: z
    .object({
      ...CommonProps,
      label: DynamicStringSchema,
      value: DynamicStringSchema.optional(),
      variant: z.enum(['filled', 'outlined', 'underlined']).default('outlined').optional(),
      action: ActionSchema.optional(),
      checks: CheckableSchema.shape.checks,
    })
    .strict(),
} satisfies ComponentApi;

export const NumberInputApi = {
  name: 'NumberInput',
  schema: z
    .object({
      ...CommonProps,
      label: DynamicStringSchema,
      value: DynamicNumberSchema.optional(),
      variant: z.enum(['filled', 'outlined', 'underlined']).default('outlined').optional(),
      action: ActionSchema.optional(),
      checks: CheckableSchema.shape.checks,
    })
    .strict(),
} satisfies ComponentApi;

export const CheckboxApi = {
  name: 'Checkbox',
  schema: z
    .object({
      ...CommonProps,
      label: DynamicStringSchema,
      value: DynamicBooleanSchema,
      action: ActionSchema.optional(),
      checks: CheckableSchema.shape.checks,
    })
    .strict(),
} satisfies ComponentApi;

export const RadioButtonApi = {
  name: 'RadioButton',
  schema: z
    .object({
      ...CommonProps,
      label: DynamicStringSchema.optional(),
      options: z.array(
        z
          .object({
            label: DynamicStringSchema,
            value: z.string(),
          })
          .strict(),
      ),
      value: DynamicStringSchema,
      action: ActionSchema.optional(),
      checks: CheckableSchema.shape.checks,
    })
    .strict(),
} satisfies ComponentApi;

export const SelectApi = {
  name: 'Select',
  schema: z
    .object({
      ...CommonProps,
      label: DynamicStringSchema.optional(),
      options: z.array(z.any()),
      value: z.union([z.string(), z.array(z.any())]),
      variant: z.enum(['multipleSelection', 'mutuallyExclusive']).default('mutuallyExclusive').optional(),
      action: ActionSchema.optional(),
      checks: CheckableSchema.shape.checks,
    })
    .strict(),
} satisfies ComponentApi;

export const AutocompleteApi = {
  name: 'Autocomplete',
  schema: z
    .object({
      ...CommonProps,
      label: DynamicStringSchema.optional(),
      options: z.array(z.any()),
      value: z.union([z.string(), z.array(z.any())]),
      variant: z.enum(['multipleSelection', 'mutuallyExclusive']).default('mutuallyExclusive').optional(),
      action: ActionSchema.optional(),
    })
    .strict(),
} satisfies ComponentApi;

export const ComboboxApi = {
  name: 'Combobox',
  schema: z
    .object({
      ...CommonProps,
      label: DynamicStringSchema.optional(),
      options: z.array(z.any()),
      value: z.union([z.string(), z.array(z.any())]),
      variant: z.enum(['multipleSelection', 'mutuallyExclusive']).default('mutuallyExclusive').optional(),
      action: ActionSchema.optional(),
    })
    .strict(),
} satisfies ComponentApi;

export const FileInputApi = {
  name: 'FileInput',
  schema: z
    .object({
      ...CommonProps,
      label: DynamicStringSchema,
      value: DynamicValueSchema.optional(),
      action: ActionSchema.optional(),
    })
    .strict(),
} satisfies ComponentApi;

export const SliderApi = {
  name: 'Slider',
  schema: z
    .object({
      ...CommonProps,
      label: DynamicStringSchema.optional(),
      min: z.number().default(0).optional(),
      max: z.number(),
      value: DynamicNumberSchema,
      action: ActionSchema.optional(),
      checks: CheckableSchema.shape.checks,
    })
    .strict(),
} satisfies ComponentApi;

export const RangeSliderApi = {
  name: 'RangeSlider',
  schema: z
    .object({
      ...CommonProps,
      label: DynamicStringSchema.optional(),
      min: z.number().default(0).optional(),
      max: z.number(),
      value: z.union([z.array(z.number()).min(2).max(2), z.object({ path: z.string() })]),
      action: ActionSchema.optional(),
    })
    .strict(),
} satisfies ComponentApi;

export const ChoicePickerApi = {
  name: 'ChoicePicker',
  schema: z
    .object({
      ...CommonProps,
      label: DynamicStringSchema.optional(),
      options: z.array(z.any()),
      value: z.union([z.string(), z.array(z.any())]),
      variant: z.enum(['multipleSelection', 'mutuallyExclusive']).default('mutuallyExclusive').optional(),
      displayStyle: z.enum(['list', 'dropdown', 'segmented']).default('dropdown').optional(),
      checks: CheckableSchema.shape.checks,
    })
    .strict(),
} satisfies ComponentApi;

// ---------------------------------------------------------------------------
// Date / Time
// ---------------------------------------------------------------------------

export const DatePickerApi = {
  name: 'DatePicker',
  schema: z
    .object({
      ...CommonProps,
      label: DynamicStringSchema.optional(),
      value: DynamicStringSchema,
      min: DynamicStringSchema.optional(),
      max: DynamicStringSchema.optional(),
      color: z.string().optional(),
      multiple: z.union([z.boolean(), z.literal('range')]).optional(),
      readonly: DynamicBooleanSchema.optional(),
      disabled: DynamicBooleanSchema.optional(),
      landscape: DynamicBooleanSchema.optional(),
      showAdjacentMonths: DynamicBooleanSchema.optional(),
      action: ActionSchema.optional(),
      checks: CheckableSchema.shape.checks,
    })
    .strict(),
} satisfies ComponentApi;

export const TimePickerApi = {
  name: 'TimePicker',
  schema: z
    .object({
      ...CommonProps,
      label: DynamicStringSchema.optional(),
      value: DynamicStringSchema,
      action: ActionSchema.optional(),
    })
    .strict(),
} satisfies ComponentApi;

export const CalendarApi = {
  name: 'Calendar',
  schema: z
    .object({
      ...CommonProps,
      events: z.array(
        z
          .object({
            name: z.string(),
            start: z.string(),
            end: z.string().optional(),
            color: z.string().optional(),
            timed: z.boolean().optional(),
          })
          .strict(),
      ),
      type: z.enum(['month', 'week', 'day', '4day', 'custom-weekly', 'custom-daily', 'category']).default('month').optional(),
      value: DynamicStringSchema.optional(),
      weekdays: z.array(z.number()).optional(),
      color: z.string().optional(),
      eventColor: z.string().optional(),
      action: ActionSchema.optional(),
    })
    .strict(),
} satisfies ComponentApi;

// ---------------------------------------------------------------------------
// Advanced & Data
// ---------------------------------------------------------------------------

export const TableApi = {
  name: 'Table',
  schema: z
    .object({
      ...CommonProps,
      items: z.array(z.any()),
      columns: z.array(
        z.object({
          title: z.string().optional(),
          key: z.string().optional(),
        }),
      ),
    })
    .strict(),
} satisfies ComponentApi;

export const TreeViewApi = {
  name: 'TreeView',
  schema: z
    .object({
      ...CommonProps,
      items: z.array(z.any()),
    })
    .strict(),
} satisfies ComponentApi;

// ---------------------------------------------------------------------------
// Media
// ---------------------------------------------------------------------------

export const VideoApi = {
  name: 'Video',
  schema: z
    .object({
      ...CommonProps,
      url: DynamicStringSchema,
      autoplay: DynamicBooleanSchema.optional(),
      controls: DynamicBooleanSchema.optional(),
      loop: DynamicBooleanSchema.optional(),
      muted: DynamicBooleanSchema.optional(),
    })
    .strict(),
} satisfies ComponentApi;

export const AudioPlayerApi = {
  name: 'AudioPlayer',
  schema: z
    .object({
      ...CommonProps,
      url: DynamicStringSchema,
      autoplay: DynamicBooleanSchema.optional(),
      controls: DynamicBooleanSchema.optional(),
      loop: DynamicBooleanSchema.optional(),
      muted: DynamicBooleanSchema.optional(),
    })
    .strict(),
} satisfies ComponentApi;

// ---------------------------------------------------------------------------
// Aggregate export — order mirrors defaultCatalog.ts registration
// ---------------------------------------------------------------------------

export const VUETIFY_COMPONENTS: ComponentApi[] = [
  TextApi,
  ImageApi,
  IconApi,
  DividerApi,
  RowApi,
  ColumnApi,
  CardApi,
  ButtonApi,
  TextFieldApi,
  TextAreaApi,
  NumberInputApi,
  CheckboxApi,
  RadioButtonApi,
  SelectApi,
  AutocompleteApi,
  ComboboxApi,
  SliderApi,
  RangeSliderApi,
  DatePickerApi,
  TimePickerApi,
  FileInputApi,
  FormApi,
  ListApi,
  TableApi,
  TreeViewApi,
  CalendarApi,
  AlertApi,
  BadgeApi,
  BannerApi,
  RatingApi,
  EmptyStateApi,
  ExpansionPanelApi,
  ChipApi,
  AvatarApi,
  TabsApi,
  ModalApi,
  VideoApi,
  AudioPlayerApi,
  ChoicePickerApi,
];

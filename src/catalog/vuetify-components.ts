import type { ComponentApi } from '@a2ui/web_core/v0_9';
import { A2UI_V09, A2UI_V10, type ProtocolKit } from '../protocol/kits';

import { buildAlertApi } from '../components/A2UIAlert.api';
import { buildAudioPlayerApi } from '../components/A2UIAudioPlayer.api';
import { buildAutocompleteApi } from '../components/A2UIAutocomplete.api';
import { buildAvatarApi } from '../components/A2UIAvatar.api';
import { buildBadgeApi } from '../components/A2UIBadge.api';
import { buildBannerApi } from '../components/A2UIBanner.api';
import { buildButtonApi } from '../components/A2UIButton.api';
import { buildCalendarApi } from '../components/A2UICalendar.api';
import { buildCardApi } from '../components/A2UICard.api';
import { buildCheckboxApi } from '../components/A2UICheckbox.api';
import { buildChipApi } from '../components/A2UIChip.api';
import { buildChoicePickerApi } from '../components/A2UIChoicePicker.api';
import { buildColumnApi } from '../components/A2UIColumn.api';
import { buildComboboxApi } from '../components/A2UICombobox.api';
import { buildDatePickerApi } from '../components/A2UIDatePicker.api';
import { buildDividerApi } from '../components/A2UIDivider.api';
import { buildEmptyStateApi } from '../components/A2UIEmptyState.api';
import { buildExpansionPanelApi } from '../components/A2UIExpansionPanel.api';
import { buildFileInputApi } from '../components/A2UIFileInput.api';
import { buildFormApi } from '../components/A2UIForm.api';
import { buildIconApi } from '../components/A2UIIcon.api';
import { buildIconButtonApi } from '../components/A2UIIconButton.api';
import { buildImageApi } from '../components/A2UIImage.api';
import { buildListApi } from '../components/A2UIList.api';
import { buildModalApi } from '../components/A2UIModal.api';
import { buildNumberInputApi } from '../components/A2UINumberInput.api';
import { buildRadioButtonApi } from '../components/A2UIRadioButton.api';
import { buildRangeSliderApi } from '../components/A2UIRangeSlider.api';
import { buildRatingApi } from '../components/A2UIRating.api';
import { buildRowApi } from '../components/A2UIRow.api';
import { buildSelectApi } from '../components/A2UISelect.api';
import { buildSliderApi } from '../components/A2UISlider.api';
import { buildTableApi } from '../components/A2UITable.api';
import { buildTabsApi } from '../components/A2UITabs.api';
import { buildTextApi } from '../components/A2UIText.api';
import { buildTextAreaApi } from '../components/A2UITextArea.api';
import { buildTextFieldApi } from '../components/A2UITextField.api';
import { buildTimePickerApi } from '../components/A2UITimePicker.api';
import { buildTreeViewApi } from '../components/A2UITreeView.api';
import { buildVideoApi } from '../components/A2UIVideo.api';

/**
 * Every built-in component's schema builder, keyed by its A2UI type name, in registration order.
 *
 * This is the one list of built-in components. Its keys are {@link VuetifyComponentName}, which
 * `defaultCatalog.ts` uses to type its Vue component map, so a component added here and not
 * registered there (or the reverse) is a compile error. The catalogs and component API lists
 * below are all derived from it.
 */
export const COMPONENT_BUILDERS = {
  Text: buildTextApi,
  Image: buildImageApi,
  Icon: buildIconApi,
  Divider: buildDividerApi,
  Row: buildRowApi,
  Column: buildColumnApi,
  Card: buildCardApi,
  Button: buildButtonApi,
  IconButton: buildIconButtonApi,
  TextField: buildTextFieldApi,
  TextArea: buildTextAreaApi,
  NumberInput: buildNumberInputApi,
  Checkbox: buildCheckboxApi,
  RadioButton: buildRadioButtonApi,
  Select: buildSelectApi,
  Autocomplete: buildAutocompleteApi,
  Combobox: buildComboboxApi,
  Slider: buildSliderApi,
  RangeSlider: buildRangeSliderApi,
  DatePicker: buildDatePickerApi,
  TimePicker: buildTimePickerApi,
  FileInput: buildFileInputApi,
  Form: buildFormApi,
  List: buildListApi,
  Table: buildTableApi,
  TreeView: buildTreeViewApi,
  Calendar: buildCalendarApi,
  Alert: buildAlertApi,
  Badge: buildBadgeApi,
  Banner: buildBannerApi,
  Rating: buildRatingApi,
  EmptyState: buildEmptyStateApi,
  ExpansionPanel: buildExpansionPanelApi,
  Chip: buildChipApi,
  Avatar: buildAvatarApi,
  Tabs: buildTabsApi,
  Modal: buildModalApi,
  Video: buildVideoApi,
  AudioPlayer: buildAudioPlayerApi,
  ChoicePicker: buildChoicePickerApi,
} as const satisfies Record<string, (kit: ProtocolKit) => ComponentApi>;

/** The A2UI type name of a built-in Vuetify component. */
export type VuetifyComponentName = keyof typeof COMPONENT_BUILDERS;

/**
 * Builds every built-in component API for one protocol family, in registration order.
 *
 * @param kit - {@link A2UI_V09} (v0.9, v0.9.1) or `A2UI_V10`.
 */
export function buildVuetifyComponents(kit: ProtocolKit): ComponentApi[] {
  return Object.values(COMPONENT_BUILDERS).map((build) => build(kit));
}

/**
 * All built-in Vuetify component API definitions for A2UI v0.9 / v0.9.1, in registration order.
 *
 * Each entry is a {@link ComponentApi} containing the component's type name and its Zod schema.
 * Exported for consumers that need programmatic access to the full catalog (e.g. for schema
 * generation or tooling).
 */
export const VUETIFY_COMPONENTS: ComponentApi[] = buildVuetifyComponents(A2UI_V09);

/** All built-in Vuetify component API definitions for A2UI v1.0, in registration order. */
export const VUETIFY_COMPONENTS_V1: ComponentApi[] = buildVuetifyComponents(A2UI_V10);

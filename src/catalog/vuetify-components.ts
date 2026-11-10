import type { ComponentApi } from '@a2ui/web_core/v0_9';
import { A2UI_V10, type ProtocolKit } from '../protocol/kits';

import { AlertApi, buildAlertApi } from '../components/A2UIAlert.api';
import { AudioPlayerApi, buildAudioPlayerApi } from '../components/A2UIAudioPlayer.api';
import { AutocompleteApi, buildAutocompleteApi } from '../components/A2UIAutocomplete.api';
import { AvatarApi, buildAvatarApi } from '../components/A2UIAvatar.api';
import { BadgeApi, buildBadgeApi } from '../components/A2UIBadge.api';
import { BannerApi, buildBannerApi } from '../components/A2UIBanner.api';
import { ButtonApi, buildButtonApi } from '../components/A2UIButton.api';
import { CalendarApi, buildCalendarApi } from '../components/A2UICalendar.api';
import { CardApi, buildCardApi } from '../components/A2UICard.api';
import { CheckboxApi, buildCheckboxApi } from '../components/A2UICheckbox.api';
import { ChipApi, buildChipApi } from '../components/A2UIChip.api';
import { ChoicePickerApi, buildChoicePickerApi } from '../components/A2UIChoicePicker.api';
import { ColumnApi, buildColumnApi } from '../components/A2UIColumn.api';
import { ComboboxApi, buildComboboxApi } from '../components/A2UICombobox.api';
import { DatePickerApi, buildDatePickerApi } from '../components/A2UIDatePicker.api';
import { DividerApi, buildDividerApi } from '../components/A2UIDivider.api';
import { EmptyStateApi, buildEmptyStateApi } from '../components/A2UIEmptyState.api';
import { ExpansionPanelApi, buildExpansionPanelApi } from '../components/A2UIExpansionPanel.api';
import { FileInputApi, buildFileInputApi } from '../components/A2UIFileInput.api';
import { FormApi, buildFormApi } from '../components/A2UIForm.api';
import { IconApi, buildIconApi } from '../components/A2UIIcon.api';
import { IconButtonApi, buildIconButtonApi } from '../components/A2UIIconButton.api';
import { ImageApi, buildImageApi } from '../components/A2UIImage.api';
import { ListApi, buildListApi } from '../components/A2UIList.api';
import { ModalApi, buildModalApi } from '../components/A2UIModal.api';
import { NumberInputApi, buildNumberInputApi } from '../components/A2UINumberInput.api';
import { RadioButtonApi, buildRadioButtonApi } from '../components/A2UIRadioButton.api';
import { RangeSliderApi, buildRangeSliderApi } from '../components/A2UIRangeSlider.api';
import { RatingApi, buildRatingApi } from '../components/A2UIRating.api';
import { RowApi, buildRowApi } from '../components/A2UIRow.api';
import { SelectApi, buildSelectApi } from '../components/A2UISelect.api';
import { SliderApi, buildSliderApi } from '../components/A2UISlider.api';
import { TableApi, buildTableApi } from '../components/A2UITable.api';
import { TabsApi, buildTabsApi } from '../components/A2UITabs.api';
import { TextApi, buildTextApi } from '../components/A2UIText.api';
import { TextAreaApi, buildTextAreaApi } from '../components/A2UITextArea.api';
import { TextFieldApi, buildTextFieldApi } from '../components/A2UITextField.api';
import { TimePickerApi, buildTimePickerApi } from '../components/A2UITimePicker.api';
import { TreeViewApi, buildTreeViewApi } from '../components/A2UITreeView.api';
import { VideoApi, buildVideoApi } from '../components/A2UIVideo.api';

export {
  AlertApi,
  AudioPlayerApi,
  AutocompleteApi,
  AvatarApi,
  BadgeApi,
  BannerApi,
  ButtonApi,
  CalendarApi,
  CardApi,
  CheckboxApi,
  ChipApi,
  ChoicePickerApi,
  ColumnApi,
  ComboboxApi,
  DatePickerApi,
  DividerApi,
  EmptyStateApi,
  ExpansionPanelApi,
  FileInputApi,
  FormApi,
  IconApi,
  IconButtonApi,
  ImageApi,
  ListApi,
  ModalApi,
  NumberInputApi,
  RadioButtonApi,
  RangeSliderApi,
  RatingApi,
  RowApi,
  SelectApi,
  SliderApi,
  TableApi,
  TabsApi,
  TextApi,
  TextAreaApi,
  TextFieldApi,
  TimePickerApi,
  TreeViewApi,
  VideoApi,
};

/**
 * All built-in Vuetify component API definitions in registration order.
 *
 * Each entry is a {@link ComponentApi} containing the component's type name
 * and its Zod schema. Exported for consumers that need programmatic access
 * to the full catalog (e.g. for schema generation or tooling).
 *
 * Order mirrors the registration in `defaultCatalog.ts`.
 */
export const VUETIFY_COMPONENTS: ComponentApi[] = [
  TextApi,
  ImageApi,
  IconApi,
  DividerApi,
  RowApi,
  ColumnApi,
  CardApi,
  ButtonApi,
  IconButtonApi,
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

/**
 * Builds every built-in component API for one protocol family, in registration order.
 * `buildVuetifyComponents(A2UI_V09)` has the same names, order and schemas as {@link VUETIFY_COMPONENTS}.
 */
export function buildVuetifyComponents(kit: ProtocolKit): ComponentApi[] {
  return BUILDERS.map((build) => build(kit));
}

const BUILDERS: ReadonlyArray<(kit: ProtocolKit) => ComponentApi> = [
  buildTextApi,
  buildImageApi,
  buildIconApi,
  buildDividerApi,
  buildRowApi,
  buildColumnApi,
  buildCardApi,
  buildButtonApi,
  buildIconButtonApi,
  buildTextFieldApi,
  buildTextAreaApi,
  buildNumberInputApi,
  buildCheckboxApi,
  buildRadioButtonApi,
  buildSelectApi,
  buildAutocompleteApi,
  buildComboboxApi,
  buildSliderApi,
  buildRangeSliderApi,
  buildDatePickerApi,
  buildTimePickerApi,
  buildFileInputApi,
  buildFormApi,
  buildListApi,
  buildTableApi,
  buildTreeViewApi,
  buildCalendarApi,
  buildAlertApi,
  buildBadgeApi,
  buildBannerApi,
  buildRatingApi,
  buildEmptyStateApi,
  buildExpansionPanelApi,
  buildChipApi,
  buildAvatarApi,
  buildTabsApi,
  buildModalApi,
  buildVideoApi,
  buildAudioPlayerApi,
  buildChoicePickerApi,
];

/** All built-in Vuetify component API definitions for A2UI v1.0, in registration order. */
export const VUETIFY_COMPONENTS_V1: ComponentApi[] = buildVuetifyComponents(A2UI_V10);

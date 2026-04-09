import type { ComponentApi } from '@a2ui/web_core/v0_9';

import { AlertApi } from '../components/A2UIAlert.vue';
import { AudioPlayerApi } from '../components/A2UIAudioPlayer.vue';
import { AutocompleteApi } from '../components/A2UIAutocomplete.vue';
import { AvatarApi } from '../components/A2UIAvatar.vue';
import { BadgeApi } from '../components/A2UIBadge.vue';
import { BannerApi } from '../components/A2UIBanner.vue';
import { ButtonApi } from '../components/A2UIButton.vue';
import { CalendarApi } from '../components/A2UICalendar.vue';
import { CardApi } from '../components/A2UICard.vue';
import { CheckboxApi } from '../components/A2UICheckbox.vue';
import { ChipApi } from '../components/A2UIChip.vue';
import { ChoicePickerApi } from '../components/A2UIChoicePicker.vue';
import { ColumnApi } from '../components/A2UIColumn.vue';
import { ComboboxApi } from '../components/A2UICombobox.vue';
import { DatePickerApi } from '../components/A2UIDatePicker.vue';
import { DividerApi } from '../components/A2UIDivider.vue';
import { EmptyStateApi } from '../components/A2UIEmptyState.vue';
import { ExpansionPanelApi } from '../components/A2UIExpansionPanel.vue';
import { FileInputApi } from '../components/A2UIFileInput.vue';
import { FormApi } from '../components/A2UIForm.vue';
import { IconApi } from '../components/A2UIIcon.vue';
import { ImageApi } from '../components/A2UIImage.vue';
import { ListApi } from '../components/A2UIList.vue';
import { ModalApi } from '../components/A2UIModal.vue';
import { NumberInputApi } from '../components/A2UINumberInput.vue';
import { RadioButtonApi } from '../components/A2UIRadioButton.vue';
import { RangeSliderApi } from '../components/A2UIRangeSlider.vue';
import { RatingApi } from '../components/A2UIRating.vue';
import { RowApi } from '../components/A2UIRow.vue';
import { SelectApi } from '../components/A2UISelect.vue';
import { SliderApi } from '../components/A2UISlider.vue';
import { TabsApi } from '../components/A2UITabs.vue';
import { TableApi } from '../components/A2UITable.vue';
import { TextApi } from '../components/A2UIText.vue';
import { TextAreaApi } from '../components/A2UITextArea.vue';
import { TextFieldApi } from '../components/A2UITextField.vue';
import { TimePickerApi } from '../components/A2UITimePicker.vue';
import { TreeViewApi } from '../components/A2UITreeView.vue';
import { VideoApi } from '../components/A2UIVideo.vue';

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
  TabsApi,
  TableApi,
  TextApi,
  TextAreaApi,
  TextFieldApi,
  TimePickerApi,
  TreeViewApi,
  VideoApi,
};

// Aggregate export — order mirrors defaultCatalog.ts registration
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

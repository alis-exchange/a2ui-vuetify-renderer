import type { ComponentApi } from '@a2ui/web_core/v0_9';

import { AlertApi } from '../components/A2UIAlert.api';
import { AudioPlayerApi } from '../components/A2UIAudioPlayer.api';
import { AutocompleteApi } from '../components/A2UIAutocomplete.api';
import { AvatarApi } from '../components/A2UIAvatar.api';
import { BadgeApi } from '../components/A2UIBadge.api';
import { BannerApi } from '../components/A2UIBanner.api';
import { ButtonApi } from '../components/A2UIButton.api';
import { CalendarApi } from '../components/A2UICalendar.api';
import { CardApi } from '../components/A2UICard.api';
import { CheckboxApi } from '../components/A2UICheckbox.api';
import { ChipApi } from '../components/A2UIChip.api';
import { ChoicePickerApi } from '../components/A2UIChoicePicker.api';
import { ColumnApi } from '../components/A2UIColumn.api';
import { ComboboxApi } from '../components/A2UICombobox.api';
import { DatePickerApi } from '../components/A2UIDatePicker.api';
import { DividerApi } from '../components/A2UIDivider.api';
import { EmptyStateApi } from '../components/A2UIEmptyState.api';
import { ExpansionPanelApi } from '../components/A2UIExpansionPanel.api';
import { FileInputApi } from '../components/A2UIFileInput.api';
import { FormApi } from '../components/A2UIForm.api';
import { IconApi } from '../components/A2UIIcon.api';
import { IconButtonApi } from '../components/A2UIIconButton.api';
import { ImageApi } from '../components/A2UIImage.api';
import { ListApi } from '../components/A2UIList.api';
import { ModalApi } from '../components/A2UIModal.api';
import { NumberInputApi } from '../components/A2UINumberInput.api';
import { RadioButtonApi } from '../components/A2UIRadioButton.api';
import { RangeSliderApi } from '../components/A2UIRangeSlider.api';
import { RatingApi } from '../components/A2UIRating.api';
import { RowApi } from '../components/A2UIRow.api';
import { SelectApi } from '../components/A2UISelect.api';
import { SliderApi } from '../components/A2UISlider.api';
import { TableApi } from '../components/A2UITable.api';
import { TabsApi } from '../components/A2UITabs.api';
import { TextApi } from '../components/A2UIText.api';
import { TextAreaApi } from '../components/A2UITextArea.api';
import { TextFieldApi } from '../components/A2UITextField.api';
import { TimePickerApi } from '../components/A2UITimePicker.api';
import { TreeViewApi } from '../components/A2UITreeView.api';
import { VideoApi } from '../components/A2UIVideo.api';

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

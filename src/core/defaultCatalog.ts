import { defaultRegistry } from './ComponentRegistry';
import A2UIText from '../components/A2UIText.vue';
import A2UIImage from '../components/A2UIImage.vue';
import A2UIIcon from '../components/A2UIIcon.vue';
import A2UIDivider from '../components/A2UIDivider.vue';
import A2UIRow from '../components/A2UIRow.vue';
import A2UIColumn from '../components/A2UIColumn.vue';
import A2UICard from '../components/A2UICard.vue';
import A2UIButton from '../components/A2UIButton.vue';
import A2UITextField from '../components/A2UITextField.vue';
import A2UITextArea from '../components/A2UITextArea.vue';
import A2UINumberInput from '../components/A2UINumberInput.vue';
import A2UICheckbox from '../components/A2UICheckbox.vue';
import A2UIRadioButton from '../components/A2UIRadioButton.vue';
import A2UISelect from '../components/A2UISelect.vue';
import A2UIAutocomplete from '../components/A2UIAutocomplete.vue';
import A2UICombobox from '../components/A2UICombobox.vue';
import A2UISlider from '../components/A2UISlider.vue';
import A2UIRangeSlider from '../components/A2UIRangeSlider.vue';
import A2UIDatePicker from '../components/A2UIDatePicker.vue';
import A2UITimePicker from '../components/A2UITimePicker.vue';
import A2UIFileInput from '../components/A2UIFileInput.vue';
import A2UIForm from '../components/A2UIForm.vue';
import A2UIList from '../components/A2UIList.vue';
import A2UITable from '../components/A2UITable.vue';
import A2UITreeView from '../components/A2UITreeView.vue';
import A2UICalendar from '../components/A2UICalendar.vue';
import A2UIAlert from '../components/A2UIAlert.vue';
import A2UIBadge from '../components/A2UIBadge.vue';
import A2UIBanner from '../components/A2UIBanner.vue';
import A2UIRating from '../components/A2UIRating.vue';
import A2UIEmptyState from '../components/A2UIEmptyState.vue';
import A2UIExpansionPanel from '../components/A2UIExpansionPanel.vue';
import A2UIChip from '../components/A2UIChip.vue';
import A2UIAvatar from '../components/A2UIAvatar.vue';

export function registerDefaultComponents() {
  defaultRegistry.registerAll({
    Text: A2UIText,
    Image: A2UIImage,
    Icon: A2UIIcon,
    Divider: A2UIDivider,
    Row: A2UIRow,
    Column: A2UIColumn,
    Card: A2UICard,
    Button: A2UIButton,
    TextField: A2UITextField,
    TextArea: A2UITextArea,
    NumberInput: A2UINumberInput,
    Checkbox: A2UICheckbox,
    RadioButton: A2UIRadioButton,
    Select: A2UISelect,
    Autocomplete: A2UIAutocomplete,
    Combobox: A2UICombobox,
    Slider: A2UISlider,
    RangeSlider: A2UIRangeSlider,
    DatePicker: A2UIDatePicker,
    TimePicker: A2UITimePicker,
    FileInput: A2UIFileInput,
    Form: A2UIForm,
    List: A2UIList,
    Table: A2UITable,
    TreeView: A2UITreeView,
    Calendar: A2UICalendar,
    Alert: A2UIAlert,
    Badge: A2UIBadge,
    Banner: A2UIBanner,
    Rating: A2UIRating,
    EmptyState: A2UIEmptyState,
    ExpansionPanel: A2UIExpansionPanel,
    Chip: A2UIChip,
    Avatar: A2UIAvatar,
  });
}

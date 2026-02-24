import { SelectControl } from '../../control/select-control/select-control.model';

export interface EventsChangeStatusDialogData {
  header: string;
  content?: string;
  yes?: string;
  no?: string;
  showTextInput?: boolean;
  textLabel: string;
  selectLabel: string;
  options: SelectControl[];
  showSelectInput?: boolean;
  showDriverFatigueInputFields?: boolean;
}

export interface EventsChangeStatusDialogReturn {
  confirmed: boolean;
  text?: string;
  select?: string;
  driverFatigueText1?: string;
  driverFatigueText2?: string;
  driverFatigueText3?: string;
}

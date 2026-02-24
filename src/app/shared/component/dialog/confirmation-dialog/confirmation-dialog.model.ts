export interface ConfirmationDialogData {
  header: string;
  content?: string;
  yes?: string;
  no?: string;
  showTextInput?: boolean;
  countdownTime?: number;
}

export interface ConfirmationDialogReturn {
  confirmed: boolean;
  text?: string;
}

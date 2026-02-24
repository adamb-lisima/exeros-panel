export interface MfaInactivityDialogData {
  header: string;
  content?: string;
}

export interface MfaInactivityDialogReturn {
  confirmed: boolean;
  text?: string;
}

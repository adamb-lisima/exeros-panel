export interface Alert {
  message: string;
  list?: string[];
  type: 'error' | 'success';
}

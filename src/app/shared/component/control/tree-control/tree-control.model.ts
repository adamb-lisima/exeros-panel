export interface TreeControl {
  label: string;
  value: string | number;
  profile?: { id: number; name: string }; // TODO remove from generic interface
  children?: TreeControl[];
}

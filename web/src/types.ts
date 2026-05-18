export type Realm = { id: string; name: string };
export type Pin = {
  id: string;
  label: string;
  type: string;
  x: number;
  y: number | null;
  z: number;
  notes: string;
};

export type Record = {
  id: string;
  name: string;
  note: string;
  date: string;
};

export type CalculationRecord = {
  id: string;
  round: number;
  length: number;
  headHundreds: number;
  head789: number;
  head56: number;
  head4: number;
  head3: number;
  note: string;
};

export type SettingOption = {
  id: string;
  label: string;
  description?: string;
  value: boolean;
};



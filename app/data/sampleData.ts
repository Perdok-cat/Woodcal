import {CalculationRecord, Record, SettingOption} from 'app/types';

export const sampleFiles: Record[] = [
  {
    id: '1',
    name: 'Ông 5',
    note: 'Nợ 50tr',
    date: '025-11-18T13:15:00Z'
  },
  {
    id: '2',
    name: 'Ông 6',
    note: 'Nợ 60tr',
    date: '025-11-18T13:15:00Z'
  },
  {
    id: '3',
    name: 'Ông 7',
    note: 'Nợ 70tr',
    date: '025-11-18T13:15:00Z'
  },
];

export const sampleCalculations: CalculationRecord[] = [
  {
    id: 'row-1',
    round: 0,
    length: 0,
    headHundreds: 0,
    head789: 0,
    head56: 0,
    head4: 0,
    head3: 0,
    note: '',
  },
  {
    id: 'row-2',
    round: 2,
    length: 26,
    headHundreds: 135,
    head789: 82,
    head56: 44,
    head4: 0,
    head3: 10,
    note: 'Ổn định',
  },
];

export const defaultSettings: SettingOption[] = [
  {
    id: 'autoBackup',
    label: 'Tự động sao lưu',
    description: 'Lưu bản sao ghi chú lên cloud mỗi ngày',
    value: true,
  },
  {
    id: 'reminder',
    label: 'Nhắc nhở cập nhật số liệu',
    description: 'Thông báo nhắc nhở vào 09:00 mỗi sáng',
    value: false,
  },
  {
    id: 'offlineMode',
    label: 'Chế độ ngoại tuyến',
    description: 'Chỉ đồng bộ khi có Wi-Fi',
    value: true,
  },
];


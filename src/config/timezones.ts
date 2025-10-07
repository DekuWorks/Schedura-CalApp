export interface TimezoneOption {
  value: string;
  label: string;
  offset: string;
}

export const TIMEZONES: TimezoneOption[] = [
  { value: 'UTC', label: 'UTC (Coordinated Universal Time)', offset: 'UTC+0' },
  { value: 'America/New_York', label: 'Eastern Time (ET)', offset: 'UTC-5/-4' },
  { value: 'America/Chicago', label: 'Central Time (CT)', offset: 'UTC-6/-5' },
  { value: 'America/Denver', label: 'Mountain Time (MT)', offset: 'UTC-7/-6' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (PT)', offset: 'UTC-8/-7' },
  { value: 'America/Anchorage', label: 'Alaska Time (AT)', offset: 'UTC-9/-8' },
  { value: 'Pacific/Honolulu', label: 'Hawaii Time (HT)', offset: 'UTC-10' },
  { value: 'Europe/London', label: 'Greenwich Mean Time (GMT)', offset: 'UTC+0/+1' },
  { value: 'Europe/Paris', label: 'Central European Time (CET)', offset: 'UTC+1/+2' },
  { value: 'Europe/Berlin', label: 'Central European Time (CET)', offset: 'UTC+1/+2' },
  { value: 'Europe/Rome', label: 'Central European Time (CET)', offset: 'UTC+1/+2' },
  { value: 'Europe/Madrid', label: 'Central European Time (CET)', offset: 'UTC+1/+2' },
  { value: 'Europe/Amsterdam', label: 'Central European Time (CET)', offset: 'UTC+1/+2' },
  { value: 'Europe/Stockholm', label: 'Central European Time (CET)', offset: 'UTC+1/+2' },
  { value: 'Europe/Vienna', label: 'Central European Time (CET)', offset: 'UTC+1/+2' },
  { value: 'Europe/Zurich', label: 'Central European Time (CET)', offset: 'UTC+1/+2' },
  { value: 'Europe/Dublin', label: 'Greenwich Mean Time (GMT)', offset: 'UTC+0/+1' },
  { value: 'Europe/Brussels', label: 'Central European Time (CET)', offset: 'UTC+1/+2' },
  { value: 'Europe/Copenhagen', label: 'Central European Time (CET)', offset: 'UTC+1/+2' },
  { value: 'Europe/Helsinki', label: 'Eastern European Time (EET)', offset: 'UTC+2/+3' },
  { value: 'Europe/Warsaw', label: 'Central European Time (CET)', offset: 'UTC+1/+2' },
  { value: 'Europe/Prague', label: 'Central European Time (CET)', offset: 'UTC+1/+2' },
  { value: 'Europe/Budapest', label: 'Central European Time (CET)', offset: 'UTC+1/+2' },
  { value: 'Europe/Athens', label: 'Eastern European Time (EET)', offset: 'UTC+2/+3' },
  { value: 'Europe/Istanbul', label: 'Turkey Time (TRT)', offset: 'UTC+3' },
  { value: 'Europe/Moscow', label: 'Moscow Time (MSK)', offset: 'UTC+3' },
  { value: 'Asia/Tokyo', label: 'Japan Standard Time (JST)', offset: 'UTC+9' },
  { value: 'Asia/Shanghai', label: 'China Standard Time (CST)', offset: 'UTC+8' },
  { value: 'Asia/Hong_Kong', label: 'Hong Kong Time (HKT)', offset: 'UTC+8' },
  { value: 'Asia/Singapore', label: 'Singapore Time (SGT)', offset: 'UTC+8' },
  { value: 'Asia/Seoul', label: 'Korea Standard Time (KST)', offset: 'UTC+9' },
  { value: 'Asia/Kolkata', label: 'India Standard Time (IST)', offset: 'UTC+5:30' },
  { value: 'Asia/Dubai', label: 'Gulf Standard Time (GST)', offset: 'UTC+4' },
  { value: 'Asia/Bangkok', label: 'Indochina Time (ICT)', offset: 'UTC+7' },
  { value: 'Asia/Jakarta', label: 'Western Indonesia Time (WIB)', offset: 'UTC+7' },
  { value: 'Asia/Manila', label: 'Philippine Time (PHT)', offset: 'UTC+8' },
  { value: 'Australia/Sydney', label: 'Australian Eastern Time (AET)', offset: 'UTC+10/+11' },
  { value: 'Australia/Melbourne', label: 'Australian Eastern Time (AET)', offset: 'UTC+10/+11' },
  { value: 'Australia/Brisbane', label: 'Australian Eastern Time (AET)', offset: 'UTC+10' },
  { value: 'Australia/Perth', label: 'Australian Western Time (AWT)', offset: 'UTC+8' },
  { value: 'Pacific/Auckland', label: 'New Zealand Time (NZST)', offset: 'UTC+12/+13' },
  { value: 'America/Toronto', label: 'Eastern Time (ET)', offset: 'UTC-5/-4' },
  { value: 'America/Vancouver', label: 'Pacific Time (PT)', offset: 'UTC-8/-7' },
  { value: 'America/Mexico_City', label: 'Central Time (CT)', offset: 'UTC-6/-5' },
  { value: 'America/Sao_Paulo', label: 'Brasilia Time (BRT)', offset: 'UTC-3' },
  { value: 'America/Buenos_Aires', label: 'Argentina Time (ART)', offset: 'UTC-3' },
  { value: 'America/Lima', label: 'Peru Time (PET)', offset: 'UTC-5' },
  { value: 'America/Bogota', label: 'Colombia Time (COT)', offset: 'UTC-5' },
  { value: 'America/Caracas', label: 'Venezuela Time (VET)', offset: 'UTC-4' },
  { value: 'Africa/Cairo', label: 'Eastern European Time (EET)', offset: 'UTC+2' },
  { value: 'Africa/Johannesburg', label: 'South Africa Time (SAST)', offset: 'UTC+2' },
  { value: 'Africa/Lagos', label: 'West Africa Time (WAT)', offset: 'UTC+1' },
  { value: 'Africa/Casablanca', label: 'Western European Time (WET)', offset: 'UTC+0/+1' }
];

export const getUserTimezone = (): string => {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    return 'UTC';
  }
};

export const getTimezoneByValue = (value: string): TimezoneOption | undefined => {
  return TIMEZONES.find(tz => tz.value === value);
};

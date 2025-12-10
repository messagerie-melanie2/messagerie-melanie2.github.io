import { LogEnum } from '../logenum';

export interface BnumConfigLocalKeys {
  today?: string;
  tomorrow?: string;
  day?: string;
  invalid_date?: string;
}

export interface BnumConfigOptions {
  local_keys?: BnumConfigLocalKeys;
  console_logging?: boolean;
  console_logging_level?: LogEnum;
  tag_prefix?: string;
}

export const DEFAULT_CONFIG: BnumConfigOptions = {
  local_keys: {
    today: 'Aujourd\'hui',
    tomorrow: 'Demain',
    day: 'Journée',
    invalid_date: 'Date invalide',
  },
  console_logging: true,
  console_logging_level: LogEnum.TRACE,
  tag_prefix: 'bnum',
};

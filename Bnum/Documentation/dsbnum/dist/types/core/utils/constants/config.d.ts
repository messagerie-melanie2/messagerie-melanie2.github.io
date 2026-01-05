import { LogEnum } from '../logenum';
export interface BnumConfigLocalKeys {
    today?: string;
    tomorrow?: string;
    day?: string;
    invalid_date?: string;
    last_mails?: string;
    no_mails?: string;
    last_events?: string;
    no_events?: string;
    valid_input?: string;
    invalid_input?: string;
    error_field?: string;
    search_field?: string;
}
export interface BnumConfigOptions {
    local_keys?: BnumConfigLocalKeys;
    console_logging?: boolean;
    console_logging_level?: LogEnum;
    tag_prefix?: string;
}
export declare const DEFAULT_CONFIG: BnumConfigOptions;

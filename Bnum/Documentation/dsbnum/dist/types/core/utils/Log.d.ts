export default class Log {
    static trace(context: string, ...args: any[]): void;
    static debug(context: string, ...args: any[]): void;
    static info(context: string, ...args: any[]): void;
    static warn(context: string, ...args: any[]): void;
    static error(context: string, ...args: any[]): void;
    static time(label: string): void;
    static timeEnd(label: string): void;
}

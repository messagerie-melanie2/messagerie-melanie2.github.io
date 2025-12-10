import { BnumConfig } from './configclass';
import { LogEnum } from './logenum';

export default class Log {
  static trace(context: string, ...args: any[]): void {
    if (
      BnumConfig.Get('console_logging') &&
      BnumConfig.Get('console_logging_level')! <= LogEnum.TRACE
    )
      console.trace(`[${context}] ${args.join(' ')}`);
  }

  static debug(context: string, ...args: any[]): void {
    if (
      BnumConfig.Get('console_logging') &&
      BnumConfig.Get('console_logging_level')! <= LogEnum.DEBUG
    )
      console.debug(`🔎 [${context}] ${args.join(' ')}`);
  }

  static info(context: string, ...args: any[]): void {
    if (
      BnumConfig.Get('console_logging') &&
      BnumConfig.Get('console_logging_level')! <= LogEnum.INFO
    )
      console.info(`(i) [${context}] ${args.join(' ')}`);
  }

  static warn(context: string, ...args: any[]): void {
    if (
      BnumConfig.Get('console_logging') &&
      BnumConfig.Get('console_logging_level')! <= LogEnum.WARN
    )
      console.warn(`/!\\ [${context}] ${args.join(' ')}`);
  }

  static error(context: string, ...args: any[]): void {
    if (
      BnumConfig.Get('console_logging') &&
      BnumConfig.Get('console_logging_level')! <= LogEnum.ERROR
    )
      console.error(`### [${context}] ${args.join(' ')}`);
  }

  static time(label: string): void {
    if (
      BnumConfig.Get('console_logging') &&
      BnumConfig.Get('console_logging_level')! <= LogEnum.DEBUG
    )
      console.time(label);
  }

  static timeEnd(label: string): void {
    if (
      BnumConfig.Get('console_logging') &&
      BnumConfig.Get('console_logging_level')! <= LogEnum.DEBUG
    )
      console.timeEnd(label);
  }
}

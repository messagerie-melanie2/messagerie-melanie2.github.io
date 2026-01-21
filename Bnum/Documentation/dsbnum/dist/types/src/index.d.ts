import { BnumConfigOptions } from '../core/utils/constants/config';
import { BnumConfig } from '../core/utils/configclass';
import BnumElement from '../components/bnum-element';
import RotomecaDocument, { RotomecaCssProperty, RotomecaCssRule } from '@rotomeca/document-utils';
export * from '../components/atoms';
export * from '../components/molecules';
export * from '../components/organisms';
export * from '../components/template';
declare global {
    interface Window {
        DsBnumConfig?: Partial<BnumConfigOptions>;
    }
}
export { BnumConfig as Config, BnumElement, RotomecaDocument as DsDocument, RotomecaCssProperty as DsCssProperty, RotomecaCssRule as DsCssRule, };

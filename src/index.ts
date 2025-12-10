import BnumElement from '../components/bnum-element';
import { HTMLBnumIcon } from '../components/atoms/icon/bnum-icon';
import {
  EButtonType,
  EHideOn,
  EIconPosition,
  HTMLBnumButton,
} from '../components/atoms/button/bnum-button';
import { HTMLBnumPrimaryButton } from '../components/atoms/primary-button/bnum-primary-button';
import { HTMLBnumSecondaryButton } from '../components/atoms/secondary-button/bnum-secondary-button';
import { HTMLBnumDangerButton } from '../components/atoms/danger-button/bnum-danger-button';
import HTMLBnumHelper from '../components/atoms/helper/bnum-helper';
import HTMLBnumPicture from '../components/atoms/picture/bnum-img';
import { HTMLBnumCardTitle } from '../components/molecules/card-title/bnum-card-title';
import { HTMLBnumCardElement } from '../components/organisms/card/bnum-card';
import { HTMLBnumCardItem } from '../components/molecules/bnum-card-item/bnum-card-item';
import { HTMLBnumDate } from '../components/atoms/date/bnum-date';
import { HTMLBnumCardItemMail } from '../components/molecules/bnum-card-item-mail/bnum-card-item-mail';
import { HTMLBnumCardItemAgenda } from '../components/molecules/bnum-card-item-agenda/bnum-card-item-agenda';
import { BnumConfigOptions } from '../core/utils/constants/config';
import { BnumConfig } from '../core/utils/configclass';
import { HTMLBnumCardList } from '../components/molecules/bnum-card-list/bnum-card-list';

// Déclaration pour TypeScript
declare global {
  interface Window {
    DsBnumConfig?: Partial<BnumConfigOptions>;
  }
}

// Auto-init au chargement
if (typeof window !== 'undefined' && window.DsBnumConfig) {
  BnumConfig.Initialize(window.DsBnumConfig);
}

export {
  EHideOn,
  EButtonType,
  EIconPosition,
  BnumElement,
  HTMLBnumIcon,
  HTMLBnumButton,
  HTMLBnumDangerButton,
  HTMLBnumPrimaryButton,
  HTMLBnumSecondaryButton,
  HTMLBnumHelper,
  HTMLBnumPicture,
  HTMLBnumCardTitle,
  HTMLBnumCardElement,
  HTMLBnumCardItem,
  HTMLBnumCardList,
  HTMLBnumDate,
  HTMLBnumCardItemMail,
  HTMLBnumCardItemAgenda,
  BnumConfig as Config,
};

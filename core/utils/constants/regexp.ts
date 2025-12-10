/**
 * RegEx qui permet de vérifier si un texte possède uniquement des charactères alphanumériques.
 * @constant
 * @default /^[0-9a-zA-Z]+$/
 */
export const REG_ALPHANUM = /^[0-9a-zA-Z]+$/;
export const ISO_FORMAT_REGEX = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/;
export const REG_MAILTO = /^mailto:/;
export const REG_MAIL_NAME_GLOBAL = /(^<|>$)/g;
export const REG_LIGHT_PICTURE_NAME = /(-light)\.(([\w\d]+)|\1?.+)$/;
export const REG_XSS_SAFE = /^[-.\w\s%()]+$/;

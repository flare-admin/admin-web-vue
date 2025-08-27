import i18n from './index';

export function useI18n() {
  if (!i18n.global) {
    throw new Error('i18n instance is not properly initialized');
  }

  return {
    t: i18n.global.t.bind(i18n.global),
    locale: i18n.global.locale
  };
}

export default useI18n;

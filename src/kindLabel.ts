import type { ContentKind } from './content.ts'
import type { MessageKey } from './i18n/messages.ts'

export type CustomizeTab = 'design' | 'color' | 'frame' | 'logo' | 'advanced'

export const kindLabel: Record<ContentKind, MessageKey> = {
  url: 'kindUrl',
  text: 'kindText',
  wifi: 'kindWifi',
  whatsapp: 'kindWhatsapp',
  email: 'kindEmail',
  phone: 'kindPhone',
  sms: 'kindSms',
  geo: 'kindGeo',
  vcard: 'kindVcard',
  event: 'kindEvent',
  social: 'kindSocial',
  app: 'kindApp',
  crypto: 'kindCrypto',
  menu: 'kindMenu',
  file: 'kindFile',
  payment: 'kindPayment',
}

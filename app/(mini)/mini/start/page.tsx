import { MiniBriefForm } from '@/components/mini/MiniBriefForm';

/*
 * Where the bot's «Оставить заявку» button lands.
 *
 * Nothing else is on this screen on purpose. The reader pressed a button that
 * said what this is for, and a Mini App window holds one screen: everything the
 * site puts around this form — how it works, the four steps after sending, the
 * ways to write directly — is on /start, where there is room for it and where a
 * reader can choose to go looking.
 */
export default function MiniStartPage() {
  return <MiniBriefForm />;
}

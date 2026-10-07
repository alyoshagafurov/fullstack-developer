/*
 * The vocabulary of the owner's calendar.
 *
 * A reminder's lead time is a fixed list rather than a free number: a text
 * box for minutes invites "90" when he meant an hour and a half, and the bot
 * would then warn him at a time that looks wrong on the clock. Each preset is
 * in minutes, the unit the database stores it in, with its own label for how
 * he says it. The client and the server validate against this same list, so
 * neither can accept a value the other would reject.
 */

export const reminderPresets = [0, 10, 30, 60, 180, 1440] as const;
export type ReminderMinutes = (typeof reminderPresets)[number];

export const reminderLabel: Record<ReminderMinutes, string> = {
  0: 'В момент начала',
  10: 'За 10 минут',
  30: 'За 30 минут',
  60: 'За час',
  180: 'За 3 часа',
  1440: 'За сутки',
};

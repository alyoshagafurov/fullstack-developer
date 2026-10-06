import { z } from 'zod';

/*
 * A review left through the site.
 *
 * The owner asked for three things from a client: what they wrote, how many
 * stars, and whether to show the man's or the woman's photograph beside it.
 * The two photographs are the same on every review — his decision — so the
 * form never asks for a picture.
 *
 * Nothing here is published on its own. A review lands unpublished and the
 * owner approves it in the admin, the same screen his own entries go through.
 */

export const genders = ['male', 'female'] as const;
export type Gender = (typeof genders)[number];

export const genderLabel: Record<Gender, string> = { male: 'Мужчина', female: 'Женщина' };

/**
 * The two avatar photographs, once the owner has generated and placed them.
 * Null until then: the card shows a monogram rather than a broken image.
 */
export const avatarFile: Record<Gender, string | null> = {
  male: '/avatars/man.webp',
  female: '/avatars/woman.webp',
};

/**
 * The sentence that tells a client what to write, in the owner's own framing.
 *
 * His wording, with the spelling put right: «оставьте отзыв что вам нужно былло
 * и что сделал aly для вас». A client staring at an empty box usually stalls on
 * "what do I even say"; naming the two halves of the answer — what they needed,
 * and what was built — is what unsticks them.
 */
export const reviewInvite = 'Расскажите, что вам было нужно и что aly для вас сделал.';

/*
 * The five questions, one to a screen.
 *
 * They moved out of components/reviews/ReviewForm.tsx when the same five got a
 * second surface in the Telegram Mini App. One list, two sets of chrome.
 */
export type ReviewQuestionKey = 'name' | 'company' | 'text' | 'rating' | 'gender';

export type ReviewQuestion = {
  key: ReviewQuestionKey;
  question: string;
  hint?: string;
  placeholder?: string;
};

export const reviewQuestions: ReviewQuestion[] = [
  { key: 'name', question: 'Как вас зовут?', placeholder: 'Имя' },
  {
    key: 'company',
    question: 'Из какой вы компании?',
    hint: 'Можно пропустить',
    placeholder: 'Название компании',
  },
  {
    key: 'text',
    question: 'Расскажите, как прошла работа',
    hint: `${reviewInvite} Хотя бы пару предложений.`,
    placeholder: 'Что было нужно и что получилось',
  },
  { key: 'rating', question: 'Сколько звёзд поставите?' },
  { key: 'gender', question: 'Какое фото поставить рядом?', hint: 'Одно из двух постоянных' },
];

export const reviewSchema = z.object({
  name: z.string().trim().min(2, 'Как вас зовут?').max(80, 'Слишком длинное имя'),
  company: z.string().trim().max(120, 'Слишком длинно').optional().or(z.literal('')),
  text: z
    .string()
    .trim()
    .min(20, 'Расскажите чуть подробнее — хотя бы пару предложений')
    .max(1200, 'Слишком длинно — до 1200 знаков'),
  rating: z.number().int().min(1, 'Поставьте оценку').max(5),
  gender: z.enum(genders, { message: 'Выберите фото' }),
  website: z.literal('').optional(),
  startedAt: z.number().int().positive().optional(),
});

export type ReviewInput = z.infer<typeof reviewSchema>;

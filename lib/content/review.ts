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

// src/utils/slug.ts
export const generateSlug = (text: string): string => {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .trim();
};

export const generateUniqueSlug = async (
  text: string,
  model: any,
  existingSlug?: string
): Promise<string> => {
  let slug = generateSlug(text);
  let counter = 1;

  while (true) {
    const where: any = { slug };
    if (existingSlug) {
      where.slug = { not: existingSlug };
    }

    const existing = await model.findFirst({ where });
    if (!existing) break;

    slug = `${generateSlug(text)}-${counter}`;
    counter++;
  }

  return slug;
};
export interface HeadingItem {
  level: number;
  text: string;
  slug: string;
}

const HEADING_REGEX = /^(#{1,6})\s+(.+)$/gm;

function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .trim();
}

export function extractHeadings(content: string): HeadingItem[] {
  const headings: HeadingItem[] = [];
  let match;

  while ((match = HEADING_REGEX.exec(content)) !== null) {
    const level = match[1].length;
    const text = match[2].trim();
    const slug = generateSlug(text);
    headings.push({ level, text, slug });
  }

  return headings;
}

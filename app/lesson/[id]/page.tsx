import EnglishRaccoon from "../../page";

export const dynamicParams = false;

export function generateStaticParams() {
  return Array.from({ length: 180 }, (_, index) => ({ id: String(index + 1) }));
}

export default function LessonPage() {
  return <EnglishRaccoon />;
}

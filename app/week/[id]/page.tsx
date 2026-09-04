import EnglishRaccoon from "../../page";

export const dynamicParams = false;

export function generateStaticParams() {
  return Array.from({ length: 36 }, (_, index) => ({ id: String(index + 1) }));
}

export default function WeekPage() {
  return <EnglishRaccoon />;
}

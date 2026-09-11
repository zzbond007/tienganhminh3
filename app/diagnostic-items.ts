import { orderChoiceOptions } from "./learning-integrity";

export type DiagnosticItem = {
  mode: "listen" | "vocab" | "sentence" | "read";
  prompt: string;
  spoken?: string;
  options: string[];
  answer: string;
};

const rawDiagnosticItems: DiagnosticItem[] = [
  { mode: "listen", prompt: "Bấm nghe rồi chọn nghĩa đúng.", spoken: "book", options: ["quyển sách", "cái bàn", "quả bóng"], answer: "quyển sách" },
  { mode: "listen", prompt: "Bấm nghe rồi chọn hình đúng.", spoken: "green", options: ["🟢", "🔴", "🟡"], answer: "🟢" },
  { mode: "vocab", prompt: "‘gia đình’ trong tiếng Anh là gì?", options: ["family", "friend", "school"], answer: "family" },
  { mode: "vocab", prompt: "Chọn từ chỉ hành động ‘đọc’.", options: ["read", "write", "listen"], answer: "read" },
  { mode: "sentence", prompt: "Chọn câu giới thiệu tên đúng.", options: ["My name is Mai.", "I name Mai is.", "Name my Mai."], answer: "My name is Mai." },
  { mode: "sentence", prompt: "Chọn câu hỏi về sở thích.", options: ["Do you like music?", "You music do?", "Music is where?"], answer: "Do you like music?" },
  { mode: "read", prompt: "Tom has a red kite. What colour is the kite?", options: ["Red", "Blue", "Green"], answer: "Red" },
  { mode: "read", prompt: "Anna is hungry, so she eats an apple. Why does Anna eat?", options: ["She is hungry.", "She is tired.", "She is cold."], answer: "She is hungry." },
];

export const diagnosticItems: DiagnosticItem[] = rawDiagnosticItems.map((item, index) => ({
  ...item,
  options: orderChoiceOptions(item.options, item.answer, index + 1),
}));


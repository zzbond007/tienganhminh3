import type { Metadata, Viewport } from "next";
import "./globals.css";

const APP_BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export const metadata: Metadata = {
  title: "English Raccoon · Tiếng Anh thực hành lớp 3",
  description:
    "Chương trình Tiếng Anh 36 tuần cho trẻ 9 tuổi, ưu tiên nghe, nói và ghi nhớ từ vựng qua hoạt động ngắn hằng ngày.",
  manifest: `${APP_BASE_PATH}/manifest.webmanifest`,
  applicationName: "English Raccoon",
  appleWebApp: { capable: true, title: "English Raccoon", statusBarStyle: "black-translucent" },
  formatDetection: { telephone: false },
  icons: {
    icon: [
      { url: `${APP_BASE_PATH}/icons/icon-192.png`, sizes: "192x192", type: "image/png" },
      { url: `${APP_BASE_PATH}/icons/icon-512.png`, sizes: "512x512", type: "image/png" },
    ],
    shortcut: `${APP_BASE_PATH}/icons/icon-192.png`,
    apple: [{ url: `${APP_BASE_PATH}/icons/apple-touch-icon.png`, sizes: "180x180", type: "image/png" }],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#102a43",
  colorScheme: "light",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="vi"><body className="child-ui antialiased">{children}</body></html>;
}

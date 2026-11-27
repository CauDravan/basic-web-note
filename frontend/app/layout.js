import "./globals.css";
import { Inter } from "next/font/google";
import UIProvider from "@/components/UIProvider";
import NotesProvider from "@/components/NotesProvider";
import Sidebar from "@/components/Sidebar";
import Monitoring from "@/components/Monitoring";

const inter = Inter({ subsets: ["latin", "vietnamese"], weight: ["400", "500", "600", "700"], display: "swap", variable: "--font-inter" });

export const metadata = {
  title: { default: "NoteSpace", template: "%s · NoteSpace" },
  description: "NoteSpace: create, organize and search your notes in one place.",
};
export const viewport = { themeColor: "#ffffff" };

// Áp dụng theme đã lưu trước khi hiển thị (tránh nháy sáng/tối)
const themeScript = `(function(){var t="light";try{t=localStorage.getItem("notespace-theme")||(matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light")}catch(e){}document.documentElement.dataset.theme=t})();`;

export default function RootLayout({ children }) {
  return (
    <html lang="en" data-theme="light" className={inter.variable} suppressHydrationWarning>
      <head><script dangerouslySetInnerHTML={{ __html: themeScript }} /></head>
      <body>
        <UIProvider>
          <NotesProvider>
            <Sidebar />
            <div className="main-content">{children}</div>
          </NotesProvider>
        </UIProvider>
        <Monitoring />
      </body>
    </html>
  );
}

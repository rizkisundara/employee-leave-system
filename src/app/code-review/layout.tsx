import { ThemeProvider } from "@/components/theme-provider";

export default function CodeReviewLayout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <div className="min-h-screen bg-background">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          {children}
        </div>
      </div>
    </ThemeProvider>
  );
}

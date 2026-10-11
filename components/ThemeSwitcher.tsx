"use client";

const THEMES = [
  { key: "dark", className: "bg-black shadow-[inset_0_0_0_0.05em_black]" },
  { key: "light", className: "bg-cream shadow-[inset_0_0_0_0.05em_black]" },
  { key: "red", className: "bg-red shadow-[inset_0_0_0_0.05em_#ff0001]" },
];

export function ThemeSwitcher({ large = false }: { large?: boolean }) {
  function setTheme(key: string) {
    document.documentElement.setAttribute("data-theme", key);
    try {
      localStorage.setItem("theme", key);
    } catch {
      // ignore storage errors
    }
  }

  return (
    <div className="flex gap-1">
      {THEMES.map((theme) => (
        <button
          key={theme.key}
          type="button"
          aria-label={`Switch to ${theme.key} theme`}
          onClick={() => setTheme(theme.key)}
          className={`inline-block rounded-full transition-all duration-200 ease-out ${theme.className} ${
            large ? "h-[4.25rem] w-[4.25rem]" : "h-[1.125rem] w-[1.125rem]"
          }`}
        />
      ))}
    </div>
  );
}

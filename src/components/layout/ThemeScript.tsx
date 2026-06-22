import { THEME_STORAGE_KEY } from "@/lib/theme/theme";

/** Evita parpadeo al cargar: aplica clase `dark` antes de hidratar React. */
export function ThemeScript() {
  const script = `
(function() {
  try {
    var key = ${JSON.stringify(THEME_STORAGE_KEY)};
    var pref = localStorage.getItem(key);
    var dark =
      pref === 'dark' ||
      (pref === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    var root = document.documentElement;
    if (dark) root.classList.add('dark');
    else root.classList.remove('dark');
    root.style.colorScheme = dark ? 'dark' : 'light';
  } catch (e) {}
})();`;

  return (
    <script
      // eslint-disable-next-line react/no-danger -- script de tema antes de hidratar
      dangerouslySetInnerHTML={{ __html: script }}
    />
  );
}

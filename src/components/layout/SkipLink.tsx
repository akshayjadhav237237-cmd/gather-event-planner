export function SkipLink() {
  return (
    <a
      href="#main"
      className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:p-3 focus:bg-surface focus:text-ink focus:border focus:border-line-control rounded-control font-medium shadow-md transition-all"
    >
      Skip to main content
    </a>
  );
}

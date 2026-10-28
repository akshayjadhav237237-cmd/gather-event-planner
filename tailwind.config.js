/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: 'var(--color-bg)',
        surface: 'var(--color-surface)',
        sunken: 'var(--color-sunken)',
        ink: 'var(--color-ink)',
        'ink-soft': 'var(--color-ink-soft)',
        muted: 'var(--color-muted)',
        line: 'var(--color-line)',
        'line-control': 'var(--color-line-control)',
        accent: 'var(--color-accent)',
        'accent-ink': 'var(--color-accent-ink)',
        'accent-soft': 'var(--color-accent-soft)',
        'accent-deep': 'var(--color-accent-deep)',
        focus: 'var(--color-focus)',
        critical: 'var(--color-critical)',
        'critical-soft': 'var(--color-critical-soft)',
        warning: 'var(--color-warning)',
        'warning-soft': 'var(--color-warning-soft)',
        info: 'var(--color-info)',
        'info-soft': 'var(--color-info-soft)',
        success: 'var(--color-success)',
        'success-soft': 'var(--color-success-soft)',
      },
      fontFamily: {
        serif: [
          '"Instrument Serif"',
          '"Iowan Old Style"',
          '"Palatino Linotype"',
          'Georgia',
          'serif',
        ],
        sans: ['"DM Sans Variable"', '"DM Sans"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        card: '16px',
        control: '10px',
      },
    },
  },
  plugins: [],
};

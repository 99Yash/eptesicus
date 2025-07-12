import type { Config } from 'tailwindcss';
import { fontFamily } from 'tailwindcss/defaultTheme';

import web_config from '@workspace/tailwind-config';

export default {
  content: [...web_config.content, '../../packages/ui/src/*.{ts,tsx}'],
  presets: [web_config],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-geist-sans)', ...fontFamily.sans],
        mono: ['var(--font-geist-mono)', ...fontFamily.mono],
      },
    },
  },
} satisfies Config;

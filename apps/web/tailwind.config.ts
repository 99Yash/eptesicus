import type { Config } from 'tailwindcss';

import web_config from '@workspace/tailwind-config';

export default {
  presets: [web_config],
  content: [...web_config.content, '../../packages/ui/src/*.{ts,tsx}'],
} satisfies Config;

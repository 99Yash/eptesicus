import web_config from '@workspace/tailwind-config';
import type { Config } from 'tailwindcss';

export default {
  presets: [web_config],
  content: ['./src/**/*.tsx'],
} satisfies Config;

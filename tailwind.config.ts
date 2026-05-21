import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  corePlugins: { preflight: false }, // AntD owns base resets
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef6ff',
          500: '#1677ff',
          700: '#0958d9',
        },
      },
    },
  },
  plugins: [],
};
export default config;

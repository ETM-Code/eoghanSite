import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
        },
        typography: (theme: any) => ({
          DEFAULT: {
            css: {
              'code::before': {
                content: '""',
              },
              'code::after': {
                content: '""',
              },
              'blockquote p:first-of-type::before': {
                content: '""',
              },
              'blockquote p:last-of-type::after': {
                content: '""',
              },
              img: {
                marginTop: '1em',
                marginBottom: '1em',
              },
              'h1, h2, h3, h4': {
                marginTop: '1.5em',
                marginBottom: '0.5em',
              },
              a: {
                color: theme('colors.blue.600'),
                '&:hover': {
                  color: theme('colors.blue.800'),
                },
              },
            },
          },
        }),
    },
    plugins: [
      require('@tailwindcss/typography'),
    ],
  },
};
export default config;

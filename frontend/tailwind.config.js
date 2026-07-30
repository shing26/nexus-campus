/** @type {import('tailwindcss').Config} */
export default {
   darkMode: 'class',
   content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
   theme: {
     extend: {
       colors: {
         vibe: {
           bg: '#0A0D14',
           surface: '#111622',
           card: '#161C2A',
           border: '#232D42',
           cyan: '#10B981',
           purple: '#A855F7',
           emerald: '#059669',
         }
       },
       animation: {
         'border-beam': 'border-beam calc(var(--duration, 8) * 1s) infinite linear',
         'shimmer': 'shimmer 2.5s infinite linear',
       },
       keyframes: {
         'border-beam': {
           '100%': { 'offset-distance': '100%' },
         },
         'shimmer': {
           '0%': { backgroundPosition: '200% 0' },
           '100%': { backgroundPosition: '-200% 0' },
         }
       }
     },
   },
   plugins: [],
 }

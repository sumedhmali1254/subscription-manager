/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#EEEFFE',
          100: '#DCDFFE',
          200: '#BAC0FD',
          300: '#97A0FB',
          400: '#7580F9',
          500: '#6172E8', // Primary Brand (slightly lighter indigo)
          600: '#4F5FD4', // Primary Hover
          700: '#3D4DC0',
          800: '#2D3BAC',
          900: '#1E2B98',
        },
        navy: {
          900: '#1E2952', // Deep Navy
          800: '#2D3766', // Sidebar Background (slightly lighter)
          700: '#38448A',
          600: '#4554A4',
          500: '#5568BE',
        },
        teal: {
          brand: '#14A38B',
          hover: '#0F8873',
          light: '#E6F6F4',
        },
        surface: {
          bg: '#F5F6FA',
          card: '#FFFFFF',
          border: '#E7EAF0',
          subtle: '#F8FAFC',
        },
        text: {
          main: '#202744',
          secondary: '#64748B',
          muted: '#94A3B8',
        },
        status: {
          success: '#16A34A',
          'success-bg': '#ECFDF5',
          warning: '#F59E0B',
          'warning-bg': '#FFFBEB',
          danger: '#DC5656',
          'danger-bg': '#FEF2F2',
          info: '#3B82F6',
          'info-bg': '#EFF6FF',
        }
      },
      fontFamily: {
        heading: ['"DM Sans"', 'sans-serif'],
        sans: ['Outfit', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px 0 rgba(0, 0, 0, 0.03)',
        'card-hover': '0 4px 6px -1px rgba(0, 0, 0, 0.07), 0 2px 4px -1px rgba(0, 0, 0, 0.04)',
        dropdown: '0 10px 15px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -2px rgba(0, 0, 0, 0.04)',
      },
    },
  },
  plugins: [],
}

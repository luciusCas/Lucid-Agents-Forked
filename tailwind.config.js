/** @type {import('tailwindcss').Config} */
module.exports = {
	darkMode: ['class'],
	content: [
		'./pages/**/*.{ts,tsx}',
		'./components/**/*.{ts,tsx}',
		'./app/**/*.{ts,tsx}',
		'./src/**/*.{ts,tsx}',
	],
	theme: {
		container: {
			center: true,
			padding: '0.23rem',
			screens: {
				'2xl': '1400px',
			},
		},
		extend: {
			fontFamily: {
				sans: ['Antic', 'sans-serif'],
				serif: ['Signifier', 'serif'],
				mono: ['JetBrains Mono', 'monospace'],
			},
			letterSpacing: {
				tighter: '-0.05em',
				tight: '-0.025em',
				normal: '0em',
				wide: '0.025em',
				wider: '0.05em',
				widest: '0.1em',
			},
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))',
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))',
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))',
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))',
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))',
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))',
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))',
				},
				chart: {
					'1': 'hsl(var(--chart-1))',
					'2': 'hsl(var(--chart-2))',
					'3': 'hsl(var(--chart-3))',
					'4': 'hsl(var(--chart-4))',
					'5': 'hsl(var(--chart-5))',
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))',
				},
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)',
			},
			spacing: {
				DEFAULT: '0.23rem',
			},
			boxShadow: {
				sm: '0 1px 2px 0 hsla(var(--shadow-color), var(--shadow-opacity))',
				DEFAULT: '0 1px 3px 0 hsla(var(--shadow-color), var(--shadow-opacity)), 0 1px 2px -1px hsla(var(--shadow-color), var(--shadow-opacity))',
				md: '0 4px 6px -1px hsla(var(--shadow-color), var(--shadow-opacity)), 0 2px 4px -2px hsla(var(--shadow-color), var(--shadow-opacity))',
				lg: '0 10px 15px -3px hsla(var(--shadow-color), var(--shadow-opacity)), 0 4px 6px -4px hsla(var(--shadow-color), var(--shadow-opacity))',
				xl: '0 20px 25px -5px hsla(var(--shadow-color), var(--shadow-opacity)), 0 8px 10px -6px hsla(var(--shadow-color), var(--shadow-opacity))',
				'2xl': '0 25px 50px -12px hsla(var(--shadow-color), var(--shadow-opacity))',
			},
			keyframes: {
				'accordion-down': {
					from: { height: '0' },
					to: { height: 'var(--radix-accordion-content-height)' },
				},
				'accordion-up': {
					from: { height: 'var(--radix-accordion-content-height)' },
					to: { height: '0' },
				},
				'fade-in': {
					from: { opacity: '0' },
					to: { opacity: '1' },
				},
				'slide-in-up': {
					from: { opacity: '0', transform: 'translateY(30px)' },
					to: { opacity: '1', transform: 'translateY(0)' },
				},
				'slide-in-down': {
					from: { opacity: '0', transform: 'translateY(-30px)' },
					to: { opacity: '1', transform: 'translateY(0)' },
				},
				'slide-in-left': {
					from: { opacity: '0', transform: 'translateX(-40px)' },
					to: { opacity: '1', transform: 'translateX(0)' },
				},
				'slide-in-right': {
					from: { opacity: '0', transform: 'translateX(40px)' },
					to: { opacity: '1', transform: 'translateX(0)' },
				},
				'scale-in': {
					from: { opacity: '0', transform: 'scale(0.95)' },
					to: { opacity: '1', transform: 'scale(1)' },
				},
				'scale-in-large': {
					from: { opacity: '0', transform: 'scale(0.85)' },
					to: { opacity: '1', transform: 'scale(1)' },
				},
				'bounce-in': {
					'0%': { opacity: '0', transform: 'scale(0.85)' },
					'50%': { opacity: '1' },
					'70%': { transform: 'scale(1.05)' },
					'100%': { opacity: '1', transform: 'scale(1)' },
				},
				'float-in': {
					from: { opacity: '0', transform: 'translateY(20px)' },
					to: { opacity: '1', transform: 'translateY(0)' },
				},
				'glow-pulse': {
					'0%, 100%': { boxShadow: '0 0 0 0 rgba(124, 144, 130, 0.4)' },
					'50%': { boxShadow: '0 0 0 10px rgba(124, 144, 130, 0)' },
				},
				'light-pulse': {
					'0%, 100%': { opacity: '1' },
					'50%': { opacity: '0.8' },
				},
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'fade-in': 'fade-in 0.8s cubic-bezier(0.4, 0.0, 0.2, 1) forwards',
				'slide-in-up': 'slide-in-up 0.7s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
				'slide-in-down': 'slide-in-down 0.7s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
				'slide-in-left': 'slide-in-left 0.7s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
				'slide-in-right': 'slide-in-right 0.7s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
				'scale-in': 'scale-in 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
				'scale-in-large': 'scale-in-large 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
				'bounce-in': 'bounce-in 0.7s cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards',
				'float-in': 'float-in 0.9s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards',
				'glow-pulse': 'glow-pulse 2s infinite',
				'light-pulse': 'light-pulse 2s ease-in-out infinite',
			},
		},
	},
	plugins: [require('tailwindcss-animate')],
}
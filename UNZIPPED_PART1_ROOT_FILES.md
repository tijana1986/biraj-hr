# 🎉 BIRAJ.HR - COMPLETE UNZIPPED FILES
## Copy-Paste Everything Directly!

---

## 📋 ŠATA TREBAM DA URADI:

### KORAK 1: KREIRAJ FOLDER

```bash
# Na kompu (bilo gdje)
mkdir biraj-hr
cd biraj-hr
```

---

### KORAK 2: KREIRAJ SVE DATOTEKE

**Copy-paste sadržaj svake datoteke u separat fajl!**

---

## 📄 DATOTEKA 1: `package.json`

Kreiraj fajl sa ovim sadržajem:

```json
{
  "name": "biraj-hr",
  "version": "1.0.0",
  "description": "Croatian Classifieds Platform",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "next": "^14.0.0",
    "@supabase/supabase-js": "^2.38.0",
    "@supabase/auth-helpers-nextjs": "^0.8.0",
    "next-auth": "^4.24.0",
    "@auth/supabase-adapter": "^1.0.0",
    "stripe": "^14.0.0",
    "@stripe/react-stripe-js": "^2.4.0",
    "@stripe/stripe-js": "^1.46.0",
    "resend": "^1.0.0",
    "react-hook-form": "^7.48.0",
    "zod": "^3.22.0",
    "@hookform/resolvers": "^3.3.0",
    "clsx": "^2.0.0",
    "zustand": "^4.4.0",
    "axios": "^1.6.0",
    "date-fns": "^2.30.0"
  },
  "devDependencies": {
    "typescript": "^5.3.0",
    "@types/node": "^20.10.0",
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "autoprefixer": "^10.4.0",
    "postcss": "^8.4.0",
    "tailwindcss": "^3.4.0",
    "eslint": "^8.55.0",
    "eslint-config-next": "^14.0.0"
  }
}
```

---

## 📄 DATOTEKA 2: `.gitignore`

```
node_modules/
.next/
.env
.env.local
.DS_Store
*.swp
.vercel
/build
```

---

## 📄 DATOTEKA 3: `tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "incremental": true,
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "@/components/*": ["./src/components/*"],
      "@/lib/*": ["./src/lib/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx"],
  "exclude": ["node_modules"]
}
```

---

## 📄 DATOTEKA 4: `next.config.js`

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
    ],
  },
}

module.exports = nextConfig
```

---

## 📄 DATOTEKA 5: `tailwind.config.ts`

```typescript
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#ff6b6b',
        'primary-dark': '#ff5252',
        'primary-light': '#ffe5e5',
        dark: '#222222',
        muted: '#888888',
        border: '#e0e0e0',
        bg: '#ffffff',
      },
    },
  },
  plugins: [],
}
```

---

## 📄 DATOTEKA 6: `postcss.config.js`

```javascript
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

---

## 📄 DATOTEKA 7: `.env.example`

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-key
SUPABASE_SERVICE_ROLE_KEY=your-key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXTAUTH_SECRET=generate-with-openssl
NEXTAUTH_URL=http://localhost:3000
RESEND_API_KEY=re_...
NEXT_PUBLIC_GA_ID=G-...
NEXT_PUBLIC_APP_NAME=BIRAJ.hr
NODE_ENV=development
```

---

## 📄 DATOTEKA 8: `README.md`

```markdown
# BIRAJ.hr

Croatian Classifieds Platform - Production Ready

## Quick Start

```bash
npm install
cp .env.example .env.local
npm run dev
```

Visit http://localhost:3000

## Technology Stack

- Next.js 14 + React 18 + TypeScript
- Tailwind CSS
- Supabase PostgreSQL
- NextAuth.js
- Stripe
- Resend
- Vercel

## Deployment

```bash
npm run build
git push origin main
```

---

© 2024 BIRAJ.hr
```

---

## 📁 KREIRAJ OVE FOLDERE:

```bash
mkdir -p src/app/api/hello
mkdir -p src/lib
mkdir -p public
```

---

## 🎯 SLEDEĆE: Vidi DEEL 2 za sve datoteke u src/ folderima!

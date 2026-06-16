# 🎉 BIRAJ.HR - SOURCE CODE FILES
## Part 2: All src/ Files - Copy-Paste Ready!

---

## 📁 FOLDER STRUKTURA:

```
src/
├── app/
│   ├── api/
│   │   └── hello/
│   │       └── route.ts
│   ├── auth/
│   │   └── page.tsx
│   ├── browse/
│   │   └── page.tsx
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── lib/
│   ├── supabase.ts
│   └── utils.ts
```

---

## 📄 DATOTEKA 9: `src/app/layout.tsx`

```typescript
import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'BIRAJ.hr - Hrvatski oglasni portal',
  description: 'Kupuj i prodaj sa BIRAJ.hr - najveći portal za oglase u Hrvatskoj',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="hr">
      <body className="font-sans bg-white text-gray-900">
        {children}
      </body>
    </html>
  )
}
```

---

## 📄 DATOTEKA 10: `src/app/page.tsx`

```typescript
'use client'

import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-red-500 to-red-600 text-white py-20 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-6xl font-bold mb-4">BIRAJ.hr</h1>
          <p className="text-2xl mb-8">
            Najveći portal za kupovinu i prodaju u Hrvatskoj
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/signup" className="bg-white text-red-600 px-8 py-3 rounded font-semibold hover:bg-gray-100 transition">
              Kreni sada
            </Link>
            <Link href="/browse" className="border-2 border-white px-8 py-3 rounded font-semibold hover:bg-white hover:text-red-600 transition">
              Pogledaj oglase
            </Link>
          </div>
        </div>
      </section>

      {/* Info Section */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-12">Dobrodošao na BIRAJ.hr</h2>
          <p className="text-xl text-gray-600 mb-8">
            Platforma se priprema za lansiranje sa svim funkcionalnostima
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded shadow">
              <div className="text-4xl mb-4">🚗</div>
              <h3 className="text-xl font-semibold mb-2">Automobili</h3>
              <p className="text-gray-600">Kupi i prodaj vozila</p>
            </div>
            <div className="bg-white p-8 rounded shadow">
              <div className="text-4xl mb-4">🏗️</div>
              <h3 className="text-xl font-semibold mb-2">Usluge</h3>
              <p className="text-gray-600">Pronađi profesionalce</p>
            </div>
            <div className="bg-white p-8 rounded shadow">
              <div className="text-4xl mb-4">📱</div>
              <h3 className="text-xl font-semibold mb-2">Jednostavno</h3>
              <p className="text-gray-600">Brz i siguran proces</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-red-600 text-white py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-4">Želiš prodati nešto?</h2>
          <p className="text-xl mb-8">Krenijem sa BIRAJ.hr-om i dosegni tisuće kupaca</p>
          <Link href="/signup" className="bg-white text-red-600 px-8 py-3 rounded font-semibold hover:bg-gray-100 transition inline-block">
            Kreiraj oglas sada
          </Link>
        </div>
      </section>
    </main>
  )
}
```

---

## 📄 DATOTEKA 11: `src/app/globals.css`

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html {
  scroll-behavior: smooth;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background-color: #ffffff;
  color: #222222;
}

a {
  color: inherit;
  text-decoration: none;
}

button {
  cursor: pointer;
}
```

---

## 📄 DATOTEKA 12: `src/app/browse/page.tsx`

```typescript
'use client'

export default function Browse() {
  return (
    <div className="min-h-screen bg-white py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Pregled oglasa</h1>
        
        {/* Filters */}
        <div className="mb-8 flex flex-wrap gap-2">
          <button className="bg-red-600 text-white px-6 py-2 rounded font-semibold hover:bg-red-700">
            Svi oglasi
          </button>
          <button className="border border-gray-300 px-6 py-2 rounded font-semibold hover:bg-gray-50">
            🚗 Automobili
          </button>
          <button className="border border-gray-300 px-6 py-2 rounded font-semibold hover:bg-gray-50">
            🏗️ Građevina
          </button>
          <button className="border border-gray-300 px-6 py-2 rounded font-semibold hover:bg-gray-50">
            👤 Usluge
          </button>
        </div>

        {/* Listings Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-gray-50 rounded shadow hover:shadow-lg transition-shadow p-4">
              <div className="bg-gray-200 aspect-square rounded mb-4 flex items-center justify-center">
                Slika
              </div>
              <h3 className="font-semibold text-lg mb-2">Primjer oglas {i}</h3>
              <p className="text-red-600 font-bold text-2xl mb-2">€{i * 100}</p>
              <p className="text-gray-600 text-sm">Zagreb</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
```

---

## 📄 DATOTEKA 13: `src/app/auth/page.tsx`

```typescript
'use client'

import { useState } from 'react'

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true)

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded shadow-lg p-8">
        <h1 className="text-3xl font-bold mb-2">
          {isLogin ? 'Prijava' : 'Registracija'}
        </h1>
        <p className="text-gray-600 mb-8">
          {isLogin ? 'Prijavite se na svoj profil' : 'Kreirajte novi profil'}
        </p>

        <form className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-sm font-semibold mb-2">Ime i prezime</label>
              <input
                type="text"
                className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-red-600"
                placeholder="Vaše ime"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold mb-2">Email</label>
            <input
              type="email"
              className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-red-600"
              placeholder="vas@email.com"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Lozinka</label>
            <input
              type="password"
              className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-red-600"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-red-600 text-white py-3 rounded font-semibold hover:bg-red-700 transition mt-6"
          >
            {isLogin ? 'Prijavi se' : 'Kreiraj profil'}
          </button>
        </form>

        <p className="mt-6 text-center text-gray-600">
          {isLogin ? "Nemaš profil? " : "Imaš profil? "}
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-red-600 font-semibold hover:underline"
          >
            {isLogin ? 'Registruj se' : 'Prijavi se'}
          </button>
        </p>
      </div>
    </div>
  )
}
```

---

## 📄 DATOTEKA 14: `src/lib/supabase.ts`

```typescript
import { createBrowserClient } from '@supabase/auth-helpers-nextjs'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const createSupabaseBrowserClient = () =>
  createBrowserClient(supabaseUrl, supabaseAnonKey)

export interface User {
  id: string
  email?: string
  full_name?: string
  user_type: 'seller' | 'buyer' | 'admin'
  created_at: string
}

export interface Listing {
  id: number
  title: string
  description?: string
  price?: number
  location?: string
  status: 'active' | 'inactive'
  created_at: string
}
```

---

## 📄 DATOTEKA 15: `src/lib/utils.ts`

```typescript
export function formatPrice(price: number): string {
  return `€${price.toFixed(2)}`
}

export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('hr-HR')
}

export function truncateText(text: string, length: number): string {
  return text.length > length ? `${text.substring(0, length)}...` : text
}

export function slugify(text: string): string {
  return text.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '')
}
```

---

## 📄 DATOTEKA 16: `src/app/api/hello/route.ts`

```typescript
import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({ message: 'BIRAJ.hr API is running!' })
}
```

---

## 📄 DATOTEKA 17: `public/robots.txt`

```
User-agent: *
Allow: /
Sitemap: https://biraj.hr/sitemap.xml
```

---

## ✅ SADA JE SVE GOTOVO!

Kada kreijaš sve ove datoteke u folderima, trebam:

```bash
cd biraj-hr

# Instaliraj zavisnosti
npm install

# Kreiraj .env.local
cp .env.example .env.local

# Kreni dev server
npm run dev

# Otvoriš http://localhost:3000
# → Trebao bi da vidis BIRAJ.hr landing page!
```

---

## 🎯 SADA SU KREIRANE SVE DATOTEKE!

**SLEDEĆE: Upload na GitHub!**
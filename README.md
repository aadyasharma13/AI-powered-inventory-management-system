# Starter Kit - Next.js 15 + Supabase + Drizzle ORM

A modern, full-stack starter kit built with Next.js 15, Supabase, and Drizzle ORM. Features authentication, profile management, and todo CRUD operations with real-time updates.

![Screenshot 1](screenshot/home.png)

## ✨ Features
- **Authentication** - Login, Register, and Forgot Password
- **Todo Management**
- **Profile Management**
- **AI Todo Suggestions**

## 🛠️ Tech Stack

### Frontend
- **Next.js 15**
- **TypeScript**
- **Tailwind CSS**

### Backend
- **Supabase** - Backend as a Service
  - PostgreSQL database
  - Authentication
  - File storage
- **OpenAI**
- **Drizzle ORM**

## 🚀 Getting Started

```bash
npm install

npm run db:push

npm run dev
```

### Environment Setup

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
DATABASE_URL=
OPENAI_API_KEY=
OPENAI_BASE_URL=
```

### How to run supabase rls

Go to menu SQL Editor, open supabase-rls-policies.sql and paste to SQL Editor

# 📋 Kanban Board

A modern, high-performance, and responsive Kanban Board web application built with **Next.js 16 (App Router)**, **React 19**, **Tailwind CSS v4**, and **Supabase**. Designed to help individuals and teams streamline their task management workflow with real-time updates and collaborative workspaces.

---

## 🚀 Features

- **🔒 Secure Authentication**: Robust user registration, login, and session persistence powered by Supabase Auth (utilizing server-side cookies via `@supabase/ssr`).
- **📁 Collaborative Workspaces**: Create, customize, and manage multiple workspaces. Access is controlled via workspace roles (Admin/User).
- **📊 Dynamic Kanban Board**:
  - Interactive board layouts with custom list columns (Todo, In Progress, Review, Done).
  - Drag-and-drop support to smoothly transition tasks between columns.
  - Detailed task cards featuring priorities (Low, Medium, High) and member assignments.
- **🎨 Modern Design**: Sleek, clean user interface with optimized responsiveness across all devices, styled with the utility-first Tailwind CSS v4.
- **🛠 Code Quality Controls**: Integrated Git hooks using Husky, linting via ESLint, and strict Type Checking to guarantee codebase stability.

---

## 🛠 Tech Stack

- **Framework**: [Next.js 16 (App Router)](https://nextjs.org/)
- **Library**: [React 19](https://react.dev/)
- **Database & Auth**: [Supabase](https://supabase.com/) (`@supabase/supabase-js`, `@supabase/ssr`)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Code Quality**: [ESLint](https://eslint.org/), [Husky](https://typicode.github.io/husky/)

---

## 📂 Project Structure

```bash
Kanban-Board/
├── app/                  # Next.js App Router (pages, layouts, server actions)
│   ├── (auth)/           # Authentication routes (login, auth callback)
│   ├── (dashboard)/      # Core application pages (dashboard, workspace [slug])
│   ├── globals.css       # Global styles (Tailwind CSS directives)
│   └── layout.tsx        # Root layout configuration
├── components/           # Reusable UI components
│   ├── common/           # Shared/generic components (buttons, dialogs, inputs)
│   ├── dashboard/        # Dashboard-specific components (workspace dialogs)
│   ├── kanban/           # Kanban board UI components (columns, cards, drag-n-drop)
│   ├── layout/           # Page layouts and navigational elements
│   └── theme/            # Theme provider and settings
├── types/                # TypeScript interfaces and Enum declarations
│   └── kanban.ts         # Common types for Tasks, Columns, Workspaces, and Roles
├── utils/                # Utility modules
│   └── supabase/         # Supabase client, server, and middleware configurations
├── public/               # Static assets (icons, images)
├── .husky/               # Git hooks scripts
├── tsconfig.json         # TypeScript configuration
├── package.json          # Project dependencies and npm scripts
└── README.md             # Project documentation
```

---

## ⚙️ Getting Started

### Prerequisites

Make sure you have [Node.js](https://nodejs.org/) installed (version 18.x or higher is recommended) and a package manager like `npm` or `yarn`.

### 1. Clone and Install Dependencies

```bash
# Clone the repository
git clone https://github.com/your-username/Kanban-Board.git
cd Kanban-Board

# Install dependencies
yarn install
# or
npm install
```

### 2. Set Up Environment Variables

Create a `.env.local` file in the root directory by copying the sample environment configuration:

```bash
cp .env.example .env.local
```

Open the newly created `.env.local` file and fill in your Supabase project credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-supabase-publishable-key
```

### 3. Run the Development Server

Start the project locally:

```bash
yarn dev
# or
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

---

## 🧪 Code Quality & Checking

This project enforces strict coding styles and type checking to ensure code robustness.

- **Run Linter**:
  ```bash
  yarn lint
  ```
- **Type Checking**:
  ```bash
  yarn typecheck
  ```
- **Build Production Bundle**:
  ```bash
  yarn build
  ```

---

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).

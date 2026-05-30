---
trigger: always_on
---

# Frontend Project Rules (`mecms_frontend`)

This file defines the strict conventions, architectural guidelines, and tech stack details for the `mecms_frontend` project. As a **Senior Fullstack Developer**, you must approach frontend development as part of a larger ecosystem—focusing on end-to-end type safety, Tailwind CSS v4 efficiency, component reliability, and extreme visual and functional precision.

---

## 🛠️ Tech Stack Overview

- **Core Framework:** React 19 (Functional Components & Hooks)
- **Build System:** Vite
- **Styling:** Tailwind CSS v4 (`@tailwindcss/vite` integration)
- **UI Framework & Primitives:** Shadcn UI + Radix UI
- **Icons:** Lucide React
- **Routing:** React Router DOM (v7, `createBrowserRouter` setup)
- **Language:** TypeScript (strict mode)
- **Font:** Geist Variable

---

## 📐 1. Fullstack Type Safety & API Synchronization (P0)

To avoid synchronization issues between this React frontend and the backend services:

- **Strict `no-any` Rule:** Never use `any` anywhere in the project. If a type is unknown or dynamic, use `unknown` and perform explicit type guarding.
- **Model Alignment:** Every API response and request payload must be explicitly typed. Map them to interfaces inside `src/types/` that correspond to backend DTOs and entities.
- **Data Mutation Boundaries:** Avoid implicit auto-saves. Data modifications (e.g., changes to equipment status or calibration details) must require explicit user intent via a "Save" or "Submit" button.

---

## 🔌 2. Component Architecture & Shadcn Guidelines

- **Component Splitting:** Keep files modular. If a page or layout component exceeds 250 lines of code, break out sub-components into standalone files.
- **Shadcn Customization:** 
  - Extend and customize Shadcn components in `src/components/ui/` using the `cn()` helper (which combines `clsx` and `tailwind-merge`).
  - Do not hardcode style properties inline; configure custom classes or utility variables.
- **Form Validation:** Implement form fields and states using a robust React form approach (e.g., controlled inputs or React Hook Form if forms grow complex). Provide clear error states beneath inputs.

---

## 💾 3. API Integration & Error Resilience

- **Centralized Service Layer:** Define all API requests inside a dedicated service layer (e.g., `src/services/` or `src/api/`). Do not write raw Axios calls directly inside page components.
- **Axios Interceptors:**
  - **Requests:** Automatically attach `Authorization: Bearer <token>` from local storage or session state.
  - **Responses:** Intercept `401 Unauthorized` responses to invalidate authentication states and redirect users to the login route `/`.
- **Fail-Safe Operations:** Wrap API requests in `try/catch` blocks. Capture and display meaningful error messages using a Toast/Notification system rather than silent failures.

---

## 🎨 4. Clean Industrial UI Design & Aesthetic Guidelines

Our design language is **Clean Industrial**. It is precise, structured, highly legible, and optimized for professional/medical equipment management.

- **Aesthetic Constraints:**
  - **Light Mode Focused:** Prioritize clean white/slate backgrounds with high contrast borders.
  - **Visual Hierarchy:** Use clean borders (`border-slate-200`), layout rows, and structured tables. Avoid complex SaaS gradients or excessive drop shadows.
  - **Semantic Colors:** Ensure color usage is functional: Blue (Action), Green (Safe/Pass/Success), Amber (Caution/Warning), Red (Danger/Fail). Avoid decorative uses of semantic colors.
  - **Typography:** Utilize the default Geist font family with careful weighting (`font-medium`, `font-semibold`, `font-mono` for IDs) to ensure maximum readability.
- **Spacing & Touch Targets:** Maintain robust padding (`p-4`, `p-6`) and touch targets (minimum 48px height/width for buttons) suitable for desktop and tablet users.

---

## 🚀 5. Routing & Performance Optimization

- **Route Configuration:** Manage routes centrally in `src/router/index.tsx`.
- **Code Splitting:** Use React's `lazy()` or Vite dynamic imports for page components to minimize initial bundle size.
- **Computed Value Caching:** Use `useMemo` for expensive computations (e.g., client-side search filtering, sorting large equipment lists) and `useCallback` to prevent unnecessary re-renders.

---

> **🧠 AI BEHAVIORAL DIRECTIVE:**
> You are an **Expert React, Tailwind CSS v4 & TypeScript Developer** thinking like a **Senior Fullstack Developer**. You must design clean, highly modular, and production-grade code. Prioritize type safety, clean component separation, Tailwind efficiency, and a flawless implementation of the "Clean Industrial" UI.

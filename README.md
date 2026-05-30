# MECMS Frontend (Medical Equipment Calibration & Maintenance System)

ระบบจัดการและตรวจสอบการสอบเทียบเครื่องมือแพทย์ (Frontend) พัฒนาขึ้นโดยอิงตามแนวทาง **Clean Industrial UI** ที่เน้นความถูกต้อง แม่นยำ อ่านง่าย และมีความปลอดภัยของข้อมูลสูง

---

## 🛠️ Tech Stack Overview

- **Core Framework:** React 19 (Functional Components & Hooks)
- **Build System:** Vite
- **Styling:** Tailwind CSS v4 (`@tailwindcss/vite` integration)
- **UI Framework & Primitives:** Shadcn UI + Radix UI
- **Icons:** Lucide React
- **Routing:** React Router DOM (v7, `createBrowserRouter` setup)
- **State Management:** Zustand (v5)
- **Language:** TypeScript (Strict Mode)
- **Font:** Geist Variable

---

## 📁 โครงสร้างโฟลเดอร์ของโปรเจกต์ (Project Directory Structure)

โครงสร้างโฟลเดอร์หลักภายใต้ `src/` ได้รับการจัดระเบียบตามหน้าที่และความรับผิดชอบของแต่ละโมดูลอย่างชัดเจน:

```text
src/
├── assets/             # ไฟล์ Static Assets เช่น รูปภาพ โลโก้ และไอคอนต่างๆ
├── components/         # คอมโพเนนต์ที่ใช้ซ้ำได้ทั่วไป (Shared Components)
│   └── ui/             # Shadcn UI Components (เช่น button.tsx)
├── context/            # Context สำหรับการแชร์ State ในระดับย่อย (Sub-tree)
├── hooks/              # Custom React Hooks สำหรับ Logic ที่ใช้ซ้ำได้
├── layouts/            # เลย์เอาต์หลักของแอปพลิเคชัน (Layout Components)
│   ├── MainLayout.tsx       # เลย์เอาต์หลักหลังเข้าสู่ระบบ (มี Sidebar, Header)
│   └── FullScreenLayout.tsx # เลย์เอาต์แบบเต็มหน้าจอ (เช่น หน้า Login)
├── lib/                # ไฟล์ยูทิลิตี้และคอนฟิกูเรชันของไลบรารี
│   └── utils.ts             # ฟังก์ชันการผสานคลาส CSS (`cn` helper จาก clsx & tailwind-merge)
├── pages/              # หน้าจอหลักของแอปพลิเคชัน (Page Components)
│   ├── LoginPage.tsx        # หน้าล็อกอินเข้าสู่ระบบ
│   ├── HomePage.tsx         # หน้า Dashboard สรุปภาพรวมของระบบ
│   ├── ToolsPage.tsx        # หน้าจัดการเครื่องมือและอุปกรณ์ (Standard Tools)
│   ├── CalibrationPage.tsx  # หน้าบันทึกและจัดการการสอบเทียบเครื่องมือ
│   ├── HistoryPage.tsx      # หน้าประวัติการสอบเทียบและการทำงานย้อนหลัง
│   └── UsersPage.tsx        # หน้าจัดการข้อมูลผู้ใช้งานและสิทธิ์ต่างๆ
├── router/             # ระบบจัดการเส้นทาง (Routing)
│   └── index.tsx            # กำหนดจุดเชื่อมต่อ URL และการแมปคู่หน้าจอกับ Layout (React Router DOM v7)
├── services/           # ชั้นติดต่อกับ Backend API (API Service Layer)
│   └── authService.ts       # บริการจัดการคำขอเกี่ยวกับ Authentication และ Session การล็อกอิน
├── stores/             # ระบบจัดการสถานะส่วนกลางระดับแอปพลิเคชัน (Global State)
│   └── authStore.ts         # จัดเก็บข้อมูลผู้ใช้งานและ Auth Token ปัจจุบันด้วย Zustand
├── types/              # การกำหนดโครงสร้างประเภทข้อมูลของ TypeScript
│   └── auth.ts              # อินเทอร์เฟซโครงสร้างข้อมูลผู้ใช้งานและ API response เกี่ยวกับ Auth
├── App.tsx             # ไฟล์ Entry Component หลักของแอปพลิเคชัน
├── index.css           # ไฟล์ CSS หลักสำหรับการนำเข้า Tailwind v4 และการตั้งค่า Font
└── main.tsx            # จุดเริ่มต้นการเรนเดอร์ React แอปพลิเคชันเข้าสู่ DOM
```

---

## 📐 กฎเกณฑ์และแนวทางการพัฒนา (Development Conventions)

เพื่อให้โค้ดมีความเป็นระเบียบ ปลอดภัย และบำรุงรักษาง่าย โปรเจกต์นี้มีกฎเหล็กที่ทุกคนต้องปฏิบัติตามดังนี้:

### 1. Fullstack Type Safety & API Alignment (P0)
- **Strict `no-any` Rule:** ห้ามใช้ `any` ในทุกส่วนของโค้ดเด็ดขาด หากไม่ทราบชนิดข้อมูลที่แน่นอนให้ใช้ `unknown` และทำการ Type Guard อย่างถูกต้อง
- **Model Alignment:** ทุก ๆ การร้องขอและการตอบกลับจาก API จะต้องมี Interface กำหนดไว้ใน `src/types/` ให้สอดคล้องกับ DTOs ของระบบ Backend เสมอ
- **Data Mutation Boundaries:** ข้อมูลสำคัญจะต้องไม่มีการ Auto-save ทุกการอัปเดตสถานะต้องเกิดขึ้นจากเจตนาของผู้ใช้เท่านั้นผ่านปุ่ม "บันทึก" หรือ "ส่งข้อมูล"

### 2. UI / UX Design System (Clean Industrial Style)
- **Light Mode Focused:** ออกแบบโดยเน้นพื้นหลังโทนสีสว่าง (White/Slate) และมีเส้นขอบที่ชัดเจน (`border-slate-200`)
- **Semantic Colors:** การใช้สีจะต้องมีความหมายเชิงฟังก์ชันเท่านั้น:
  - **น้ำเงิน (Blue):** สำหรับ Actions/การคลิก
  - **เขียว (Green):** สถานะปลอดภัย / ผ่าน (Pass) / สำเร็จ
  - **ส้ม/เหลือง (Amber):** คำเตือน / ตรวจสอบ (Warning/Caution)
  - **แดง (Red):** อันตราย / ไม่ผ่าน (Fail/Danger)
  *หลีกเลี่ยงการใช้สีเหล่านี้เพื่อความสวยงามเพียงอย่างเดียว*
- **Typography:** ใช้ฟอนต์ **Geist** และน้ำหนักตัวอักษรอย่างเหมาะสม (`font-mono` สำหรับรหัสเครื่องมือหรือ ID ต่างๆ เพื่อให้อ่านง่ายและไม่ตกหล่น)

### 3. Component & State Architecture
- **Zustand Stores:** เก็บเฉพาะ Global State ที่มีความสำคัญระดับระบบ เช่น เซสชันล็อกอิน ข้อมูลผู้ใช้ปัจจุบัน
- **Local State:** ข้อมูล UI ที่เป็นระดับหน้าจอ (เช่น สถานะการเปิด/ปิด Dialog, ข้อมูลฟอร์มชั่วคราว) ให้คงไว้ในระดับ Component โดยใช้ `useState` หรือ `useRef` เสมอ
- **Component Splitting:** หลีกเลี่ยงไฟล์ที่มีขนาดใหญ่เกิน 250 บรรทัด หากหน้าเว็บหรือคอมโพเนนต์เริ่มยาวขึ้น ให้แยกส่วนประกอบเป็นคอมโพเนนต์ย่อย ๆ

---

## 🚀 คำสั่งใช้งานและขั้นตอนการเริ่มพัฒนา

ก่อนเริ่มต้นพัฒนา ตรวจสอบให้แน่ใจว่าติดตั้ง Node.js เรียบร้อยแล้ว จากนั้นรันคำสั่งดังต่อไปนี้:

### 1. ติดตั้ง Dependencies
```bash
npm install
```

### 2. รันโปรเจกต์ในโหมดพัฒนา (Development Server)
```bash
npm run dev
```
*ระบบจะเริ่มทำงานที่ http://localhost:5173 (หรือพอร์ตอื่นตามที่ระบุใน Terminal)*

### 3. การตรวจสอบข้อผิดพลาดของสไตล์และโค้ด (Linting)
```bash
npm run lint
```

### 4. บิลด์โปรเจกต์สำหรับ Production
```bash
npm run build
```
*ผลลัพธ์จะถูกจัดเก็บไว้ในโฟลเดอร์ `dist/` สำหรับการนำไป Deploy ต่อไป*


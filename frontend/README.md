# Tabungan Impian

Sistem menabung untuk barang impian. User menambah barang (gambar dan harga),
menabung sampai target tercapai, lalu mengambil uangnya.

## Teknologi
Express.js + TypeScript, PostgreSQL (Aiven), Cloudinary, HTML + Tailwind CLI, Vercel

## Fitur
- Register dan login (JWT, password di-hash bcrypt)
- CRUD target tabungan, upload gambar ke Cloudinary
- Authorization: role USER dan ADMIN, user hanya bisa mengakses targetnya sendiri

## Cara menjalankan
1. Backend: masuk ke folder backend, salin .env.example menjadi .env dan isi nilainya,
   jalankan schema.sql di database, lalu npm install dan npm run dev
2. Frontend: masuk ke folder frontend, npm install, npm run dev, lalu npm run serve

## Endpoint
POST /api/auth/register, POST /api/auth/login, GET/POST /api/goals,
PUT/DELETE /api/goals/:id, POST /api/goals/:id/savings, GET /api/admin/users
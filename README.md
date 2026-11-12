# Portofolio – Muhammad Rayyan Nafis

Website portofolio statis (HTML + CSS + JavaScript murni, tanpa build).

## Struktur
```
index.html      → isi halaman (Home, Tentang, Portofolio)
css/style.css   → semua tampilan
js/main.js      → bintang 3D, objek 3D, pindah halaman, tab, game
```

## Ganti foto
Di `index.html`, cari `id="fotoProfil"` lalu ganti `src` dengan link langsung ke gambar
(berakhiran `.jpg` / `.png` / `.webp`), atau taruh file `foto-profil.jpg` di folder ini
dan isi `src="foto-profil.jpg"`.

## Deploy ke Vercel
1. Upload semua isi folder ini ke repo GitHub (`index.html`, `css/`, `js/`).
2. Di Vercel: **Add New → Project → pilih repo** → Framework Preset: **Other** → **Deploy**.
   Tidak perlu build command dan output directory.

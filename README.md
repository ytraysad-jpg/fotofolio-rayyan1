# Portofolio – Muhammad Rayyan Nafis

Website portofolio statis (HTML + CSS + JavaScript murni, tanpa build).

## Struktur
```
index.html      → isi halaman (Home, Tentang, Portofolio)
css/style.css   → semua tampilan
js/main.js      → bintang 3D, objek 3D, pindah halaman, tab, game, suara tombol
```

## Ganti foto
Buka `index.html`, cari tulisan `id="fotoProfil"`, lalu ganti isi `src="..."`.

**Cara 1 – foto di folder sendiri (paling aman, tidak kedaluwarsa)**
1. Buat folder `img/` lalu taruh fotonya, misalnya `img/foto-profil.jpg`.
2. Ubah menjadi `src="img/foto-profil.jpg"`.
3. Upload ulang ke GitHub, Vercel akan memperbarui otomatis.

**Cara 2 – link gambar langsung (misalnya Imgur)**
1. Buka foto di Imgur, klik kanan pada foto, pilih *Salin alamat gambar*.
2. Pastikan linknya berbentuk `https://i.imgur.com/xxxxxxx.jpg` (berakhiran `.jpg`/`.png`/`.webp`).
3. Tempel ke `src="..."`.

Link halaman atau album (misalnya `imgur.com/a/...`) tidak bisa dipakai.
Kalau foto gagal dimuat, otomatis tampil avatar "RN".

## Deploy ke Vercel
1. Upload semua isi folder ini ke repo GitHub (`index.html`, `css/`, `js/`).
2. Di Vercel: **Add New → Project → pilih repo** → Framework Preset: **Other** → **Deploy**.
   Tidak perlu build command dan output directory.

## Isi link Preview & File GitHub
Di `index.html`, tiap kartu proyek punya dua atribut kosong. Isi dengan link lengkap (`https://...`):
```html
<article class="card tilt" data-tilt="8" data-preview="https://nama-proyek.vercel.app" data-repo="https://github.com/username/nama-repo">
```
- `data-preview` → tombol **Preview** (website yang sudah live)
- `data-repo` → tombol **File GitHub** (repo berisi file proyek)

Kalau masih kosong, tombol menampilkan pesan "link belum diisi".

## Tombol & suara
- Semua tombol memakai gaya liquid glass (`.btn`, `.tab`, navigasi, tombol suara).
- Suara klik dibuat dengan Web Audio (tanpa file audio). Tombol speaker di pojok kanan bawah untuk menyalakan/mematikan suara.

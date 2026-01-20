# ZEE WEB - Static site (Home / Music / Videos / Game -> Roblox / The Forge & Fish It)

Deskripsi singkat:
- Single-page site dengan menu: Home, Music, Videos, Game.
- Game → Roblox → dua sub-menu: THE FORGE dan FISH IT (halaman daftar item).
- Admin dapat menambah/ubah/hapus: musik, video, dan item (nama/harga/deskripsi/gambar).
- Tombol "Beli" pada item akan membuka WhatsApp ke nomor: 085780024940 (menggunakan wa.me).
- Data disimpan di localStorage dan dapat diekspor/impor sebagai JSON.

Cara pakai lokal:
1. Taruh file `index.html`, `styles.css`, `app.js`, `README.md` dalam satu folder.
2. Buka `index.html` di browser untuk mencoba.

Admin:
- Password default: `admin123` (ubah di app.js bila perlu).
- Hanya admin yang dapat menambahkan musik/video/item.
- Admin dapat mengekspor konfigurasi menjadi JSON dan mengimpor ulang.

Deploy ke GitHub Pages:
1. Buat repo baru (mis. `username/zee-web`).
2. Commit file-file di folder project dan push ke GitHub.
3. Di GitHub > Settings > Pages: pilih branch `main` dan folder `/ (root)`, simpan.
4. Tunggu beberapa menit. Situs tersedia di `https://username.github.io/zee-web/`.

Atau deploy cepat ke Netlify:
- Zip folder dan drag-&-drop ke https://app.netlify.com/drop

Catatan:
- Saat ini pembayaran hanyalah membuka WhatsApp pembeli ke nomormu; integrasi payment gateway memerlukan backend dan API keys.
- Jika mau saya bisa bantu:
  - Mengubah admin authentication menjadi berbasis server (lebih aman).
  - Menyambungkan data ke backend (Node.js + DB) agar data tersimpan terpusat.
  - Tambahkan integrasi pembayaran nyata.
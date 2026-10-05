-- Teks yang bisa diubah dari dashboard admin (keterangan foto jeda).
-- Opsional dijalankan manual: tabel ini juga dibuat otomatis saat teks pertama disimpan.
create table if not exists site_texts (
  key text primary key,
  value text not null
);

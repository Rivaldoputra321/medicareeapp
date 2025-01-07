
import { source } from '../data-source';
import { seedAdmin } from './admin.seeder';
import { seedDatabase } from './role.seeder';

async function runSeed() {
  try {
    // Inisialisasi koneksi ke database
    await source.initialize();

    // Jalankan fungsi seed
    await seedDatabase(source);

    await seedAdmin(source);

    console.log('Seeding selesai.');
  } catch (error) {
    console.error('Terjadi kesalahan saat melakukan seeding:', error);
  } finally {
    // Tutup koneksi
    await source.destroy();
  }
}

runSeed();

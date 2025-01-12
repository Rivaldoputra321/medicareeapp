import { DataSource } from "typeorm";
import { peran, Role } from "../entities/roles.entity";
import { User } from "../entities/users.entity";
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

export async function seedAdmin(source: DataSource) {
  const roleRepository = source.getRepository(Role);
  const userRepository = source.getRepository(User);

  try {
    // Cari peran admin
    const adminRole = await roleRepository.findOne({ where: { name: peran.ADMIN } });
    if (!adminRole) {
      console.error('Peran Admin tidak ditemukan! Pastikan roles telah di-seed terlebih dahulu.');
      return;
    }

    // Cek apakah admin sudah ada
    const existingAdmin = await userRepository.findOne({ where: { roleId: adminRole.id } });
    if (existingAdmin) {
      console.log('Pengguna admin sudah ada.');
      return;
    }

    // Hash password untuk admin
    const salt = uuidv4();
    const hashedPassword = bcrypt.hashSync('admin123' + salt, 10);

    // Buat pengguna admin
    const adminUser = userRepository.create({
      id: uuidv4(),
      name: 'Admin',
      email: 'admin@gmail.com',
      password: hashedPassword,
      salt: salt,
      roleId: adminRole.id,  // Menghubungkan dengan peran Admin
      photo_profile: null,
    });

    // Simpan pengguna admin
    await userRepository.save(adminUser);
    console.log('Pengguna admin berhasil ditambahkan.');

  } catch (error) {
    console.error('Terjadi kesalahan saat melakukan seeding pengguna admin:', error);
  }
}

import { DataSource } from "typeorm";
import { peran, Role } from "../entities/roles.entity";
import { source } from "src/data-source";

export async function seedDatabase(source: DataSource) {
    const roleRepository = source.getRepository(Role);
  
    const roleCount = await roleRepository.count();
    if (roleCount === 0) {
      const roles = [
        roleRepository.create({ name: peran.ADMIN }),
        roleRepository.create({ name: peran.PATIENT }),
        roleRepository.create({ name: peran.DOCTOR }),
      ];
      await roleRepository.save(roles);
      console.log('Data awal berhasil ditambahkan ke tabel Role.');
    }
  }
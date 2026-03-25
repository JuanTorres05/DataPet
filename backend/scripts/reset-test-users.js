// Script para regenerar usuarios de prueba con hash bcrypt correcto
// Ejecutar: node scripts/reset-test-users.js

import bcrypt from 'bcryptjs';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const PASSWORD = 'test1234';

async function main() {
    const conn = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        port: Number(process.env.DB_PORT || 3307),
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'datavet',
    });

    const hash = await bcrypt.hash(PASSWORD, 12);
    console.log('Hash generado:', hash);

    const users = [
        { cedula: '0000000001', nombre: 'Admin Test', rol: 'admin' },
        { cedula: '0000000002', nombre: 'Veterinario Test', rol: 'veterinario' },
        { cedula: '0000000003', nombre: 'Recepcionista Test', rol: 'recepcionista' },
    ];

    for (const u of users) {
        // Obtener el rol_id
        const [[rol]] = await conn.execute(
            'SELECT id FROM roles WHERE nombre = ?', [u.rol]
        );

        if (!rol) {
            console.error(`❌ Rol no encontrado: ${u.rol}`);
            continue;
        }

        await conn.execute(
            `INSERT INTO usuarios (cedula, nombre, password_hash, rol_id, activo)
       VALUES (?, ?, ?, ?, 1)
       ON DUPLICATE KEY UPDATE
         nombre = VALUES(nombre),
         password_hash = VALUES(password_hash),
         rol_id = VALUES(rol_id),
         activo = 1`,
            [u.cedula, u.nombre, hash, rol.id]
        );

        console.log(`✅ Usuario actualizado: ${u.nombre} (${u.cedula}) → rol: ${u.rol}`);
    }

    // Verificar
    const [rows] = await conn.execute(
        'SELECT cedula, nombre, activo, rol_id FROM usuarios WHERE cedula IN (?,?,?)',
        ['0000000001', '0000000002', '0000000003']
    );
    console.log('\nUsuarios en la BD:');
    console.table(rows);

    await conn.end();
    console.log(`\n🔑 Contraseña de todos: "${PASSWORD}"`);
}

main().catch(err => {
    console.error('Error:', err.message);
    process.exit(1);
});

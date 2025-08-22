import mysql from 'mysql2/promise'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

export async function POST(req) {
  try {
    const { username, password } = await req.json()

    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'stern'
    })

    const [rows] = await connection.execute('SELECT * FROM tb_users WHERE username = ?', [username])
    await connection.end()

    if (rows.length === 0) return new Response(JSON.stringify({ error: 'Username tidak ditemukan' }), { status: 401 })

    const user = rows[0]
    const isValid = await bcrypt.compare(password, user.password_hash)
    if (!isValid) return new Response(JSON.stringify({ error: 'Password salah' }), { status: 401 })

    const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, 'RAHASIA_JWT', { expiresIn: '8h' })

    return new Response(JSON.stringify({ token }), { status: 200 })
  } catch (err) {
    console.error(err)
    return new Response(JSON.stringify({ error: 'Gagal login' }), { status: 500 })
  }
}

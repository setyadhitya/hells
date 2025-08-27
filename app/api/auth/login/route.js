import mysql from 'mysql2/promise'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers'

const SECRET = process.env.JWT_SECRET || 'RAHASIA_JWT' // sebaiknya di .env

export async function POST(req) {
  try {
    const { email, password } = await req.json()

    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'stern'
    })

    // cek user berdasarkan email
    const [rows] = await connection.execute(
      'SELECT * FROM tb_users_praktikan WHERE email = ?',
      [email]
    )
    await connection.end()

    if (rows.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Email tidak ditemukan' }),
        { status: 401 }
      )
    }

    const user = rows[0]

    // cocokkan password dengan bcrypt
    const isValid = await bcrypt.compare(password, user.password)
    if (!isValid) {
      return new Response(
        JSON.stringify({ error: 'Password salah' }),
        { status: 401 }
      )
    }

    // generate token
    const token = jwt.sign(
      { id: user.id, email: user.email, id_nim: user.id_nim },
      SECRET,
      { expiresIn: '8h' }
    )

    // simpan token di cookies agar bisa dibaca server
    const cookieStore = await cookies()
    cookieStore.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60 * 8, // 8 jam
    })

    return new Response(JSON.stringify({ ok: true }), { status: 200 })
  } catch (err) {
    console.error('LOGIN ERROR:', err)
    return new Response(
      JSON.stringify({ error: 'Gagal login' }),
      { status: 500 }
    )
  }
}

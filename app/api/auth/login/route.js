import mysql from 'mysql2/promise' 
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

const SECRET = 'RAHASIA_JWT' // sebaiknya simpan di .env

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

    return new Response(JSON.stringify({ token }), { status: 200 })
  } catch (err) {
    console.error('LOGIN ERROR:', err)
    return new Response(
      JSON.stringify({ error: 'Gagal login' }),
      { status: 500 }
    )
  }
}

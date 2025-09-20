import bcrypt from 'bcryptjs'
import { db } from '../../../../lib/db'

export async function POST(req) {
  try {
    const body = await req.json() // ✅ ambil body JSON
    const { username, password, role } = body || {}

    if (!username || !password) {
      return new Response(JSON.stringify({ error: 'username & password required' }), { status: 400 })
    }

    const [exists] = await db.query('SELECT id FROM tb_users WHERE username = ?', [username])
    if (exists.length) {
      return new Response(JSON.stringify({ error: 'username taken' }), { status: 400 })
    }

    const hashed = await bcrypt.hash(password, 10)
    await db.query('INSERT INTO tb_users (username,password,role) VALUES (?, ?, ?)', [username, hashed, role || 'user'])

    return new Response(JSON.stringify({ message: 'user created' }), { status: 201 })
  } catch (err) {
    console.error(err)
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 })
  }
}

import clientPromise from '../../lib/mongodb'

export default async function handler(req, res) {
  switch (req.method) {
    case 'POST': {
      return addPost(req, res)
    }
  }
}

async function addPost(req, res) {
  try {
    const client = await clientPromise
    const db = client.db('db')
    await db.collection('words').insertOne(JSON.parse(req.body))
    return res.json({
      message: 'Word added successfully',
      success: true,
    })
  } catch (error) {
    return res.json({
      message: new Error(error).message,
      success: false,
    })
  }
}

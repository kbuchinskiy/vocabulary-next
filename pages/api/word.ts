import clientPromise from '../../lib/mongodb'
import { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  switch (req.method) {
    case 'POST': {
      return addPost(req, res)
    }
  }
}

async function addPost(req: NextApiRequest, res: NextApiResponse) {
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
      message: error instanceof Error ? error.message : 'An error occurred',
      success: false,
    })
  }
}

import Head from 'next/head'
import clientPromise from '../lib/mongodb'
import type { InferGetServerSidePropsType, GetServerSideProps } from 'next'
import WordItem from '../components/WordItem'

type PartOfSpeechDefinition = {
  partOfSpeech: string
  definitions: { definition: string; example: string }[]
}

export type Word = {
  origin: string
  translation: string
  phonetic: string
  definitions: PartOfSpeechDefinition[]
  imgUrl: string
}

type Props = {
  words: Word[]
}

export const getServerSideProps: GetServerSideProps<Props> = async () => {
  try {
    const client = await clientPromise
    const db = client.db('db')

    const words = await db.collection('words').find({}).toArray()

    return {
      props: { words: JSON.parse(JSON.stringify(words)) },
    }
  } catch (e) {
    console.error(e)
    return {
      props: { words: [] },
    }
  }
}

export default function Home({
  words,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  return (
    <div className="container">
      <Head>
        <title>Create Next App</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main>
        {words.map((word) => (
          <WordItem word={word} key={word.origin} />
        ))}
      </main>

      <style jsx>{`
        .container {
          min-height: 100vh;
          padding: 0 0.5rem;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
        }
      `}</style>

      <style jsx global>{`
        html,
        body {
          padding: 0;
          margin: 0;
          font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto,
            Oxygen, Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue,
            sans-serif;
        }

        * {
          box-sizing: border-box;
        }
      `}</style>
    </div>
  )
}

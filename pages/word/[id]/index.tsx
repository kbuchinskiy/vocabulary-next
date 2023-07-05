import { GetServerSideProps, InferGetServerSidePropsType } from 'next'
import clientPromise from '../../../lib/mongodb'
import { Word } from '../../index'

export type Props = {
  word: Word
}

export const getServerSideProps: GetServerSideProps<Props> = async (
  context,
) => {
  try {
    const origin = context.query.id
    const client = await clientPromise
    const db = client.db('db')

    const word = await db.collection('words').findOne({
      origin,
    })

    return {
      props: { word: JSON.parse(JSON.stringify(word)) },
    }
  } catch (e) {
    console.error(e)
    return {
      notFound: true,
    }
  }
}

export default function Word({
  word,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  return (
    <div>
      {word.origin}
      <br />
      {word.translation}
      <br />
      {word.phonetic}
      <ul>
        {word.definitions.map((partOfSpeechItem) => (
          <li key={partOfSpeechItem.partOfSpeech}>
            {partOfSpeechItem.partOfSpeech}
            <h3>definitions</h3>
            <ul>
              {partOfSpeechItem.definitions.map((definitionItem, key) => (
                <li key={key}>{definitionItem.definition}</li>
              ))}
            </ul>

            <h3>examples</h3>
            <ul>
              {partOfSpeechItem.definitions
                .filter((item) => item.example)
                .map((definitionItem, key) => (
                  <li key={key}>{definitionItem.example}</li>
                ))}
            </ul>
          </li>
        ))}
      </ul>
      <img width="200px" src={word.imgUrl} alt="" />
    </div>
  )
}

import Head from 'next/head'
import clientPromise from '../lib/mongodb'
import type { InferGetServerSidePropsType, GetServerSideProps } from 'next'
import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/router'
import { Providers } from './providers'
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from '@nextui-org/table'
import { TableColumn } from '@nextui-org/react'
import { Input } from '@nextui-org/input'
import { Button } from '@nextui-org/button'

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
  initialWords: Word[]
}

export const getServerSideProps: GetServerSideProps<Props> = async () => {
  try {
    const client = await clientPromise
    const db = client.db('db')

    const words = await db.collection('words').find({}).toArray()

    return {
      props: { initialWords: JSON.parse(JSON.stringify(words)) },
    }
  } catch (e) {
    console.error(e)
    return {
      props: { initialWords: [] },
    }
  }
}

export default function Home({
  initialWords,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const router = useRouter()
  const [inputData, setInputData] = useState({ origin: '', translation: '' })
  const [words, setWords] = useState(initialWords)
  const [error, setError] = useState('')

  const sortedWords = useMemo(() => {
    return [...words].reverse()
  }, [words])

  const isInputCorrect = (input: { origin: string; translation: string }) => {
    return input.origin.length && input.translation.length
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputData((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value,
    }))
  }

  useEffect(() => {
    if (isInputCorrect(inputData)) {
      setError('')
    }
  }, [inputData])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!isInputCorrect(inputData)) {
      setError('Please, make sure input is correct')
    } else {
      const postData = async () => {
        const data = inputData

        const response = await fetch('/api/word', {
          method: 'POST',
          body: JSON.stringify(data),
        })
        return response.json()
      }

      const { result } = await postData()

      setWords([...words, result])

      setInputData({ origin: '', translation: '' })
      setError('')
    }
  }

  const onRowClick = async (origin: string) => {
    await router.push(`/word/${origin}`)
  }

  return (
    <Providers>
      <div className="container">
        <Head>
          <title>Create Next App</title>
          <link rel="icon" href="/favicon.ico" />
        </Head>
        <main>
          <div>
            <form className="flex mb-2 gap-2" onSubmit={handleSubmit}>
              <Input
                type="text"
                name="origin"
                value={inputData.origin}
                onChange={handleInputChange}
                placeholder="Origin"
              />
              <Input
                type="text"
                name="translation"
                className="mx-8"
                value={inputData.translation}
                onChange={handleInputChange}
                placeholder="Translation"
                disabled
              />
              <Button type="submit">Add Word</Button>
            </form>

            {error !== undefined && (
              <p className="error" color={error ? 'danger' : 'success'}>
                {error}
              </p>
            )}

            <Table aria-label="Words table">
              <TableHeader>
                <TableColumn>Origin</TableColumn>
                <TableColumn>Translate</TableColumn>
              </TableHeader>
              <TableBody>
                {sortedWords.map((word, index) => (
                  <TableRow key={index} onClick={() => onRowClick(word.origin)}>
                    <TableCell>
                      <p className="word-item__origin"> {word.origin}</p>
                    </TableCell>
                    <TableCell>
                      <p className="word-item__translation">
                        {word.translation}
                      </p>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
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

          .error {
            color: darkred;
          }
        `}</style>
      </div>
    </Providers>
  )
}

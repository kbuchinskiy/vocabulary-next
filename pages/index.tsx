import Head from 'next/head'
import clientPromise from '../lib/mongodb'
import type { InferGetServerSidePropsType, GetServerSideProps } from 'next'
import WordItem from '../components/WordItem'
import { useState } from 'react'
import { useRouter } from 'next/router'
import { Providers } from './providers'
import { Button } from '@nextui-org/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from '@nextui-org/table'
import { TableColumn } from '@nextui-org/react'
import Link from 'next/link'
import { Input } from '@nextui-org/input'

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
  const [inputData, setInputData] = useState({ origin: '', translation: '' })
  const router = useRouter()

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputData((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    const postData = async () => {
      const data = {
        origin: inputData.origin,
        translation: inputData.translation,
      }

      const response = await fetch('/api/word', {
        method: 'POST',
        body: JSON.stringify(data),
      })
      return response.json()
    }

    await postData()
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
              />
              <Button type="submit">Add Word</Button>
            </form>

            <Table aria-label="Words table">
              <TableHeader>
                <TableColumn>Origin</TableColumn>
                <TableColumn>Translate</TableColumn>
              </TableHeader>
              <TableBody>
                {words.map((word, index) => (
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
        `}</style>
      </div>
    </Providers>
  )
}

import Link from 'next/link'

const WordItem = ({ word }) => {
  return (
    <div className="word-item">
      <Link
        href="/word/[origin]"
        as={`/word/${word.origin}`}
        className="word-item-link"
      >
        <p className="word-item__origin"> {word.origin}</p>
        <p className="word-item__translation">{word.translation}</p>
      </Link>
      <style jsx>{`
        .word-item {
          width: 300px;
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
        }

        .word-item > :global(a) {
          color: #555;
          text-decoration: none;
          width: 300px;
          display: grid;
          grid-template-columns: 1fr 1fr;
          border-bottom: 1px solid #eee;
        }

        .word-item > :global(a):hover {
          color: black;
        }

        .word-item p {
          margin: 0;
        }
      `}</style>
    </div>
  )
}

export default WordItem

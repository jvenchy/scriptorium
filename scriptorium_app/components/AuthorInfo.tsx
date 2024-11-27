import Link from 'next/link'
import Image from 'next/image'

interface AuthorInfoProps {
  author: {
    id: number
    firstName: string
    lastName: string
    email: string
    avatar: string | null
  }
  forkedFromId: number | null
}

export default function AuthorInfo({ author, forkedFromId }: AuthorInfoProps) {
  return (
    <div className="bg-gray-100 p-4 rounded-lg">
      <h2 className="text-2xl font-helvetica font-semibold mb-4">Author Information</h2>
      <div className="flex items-center">
        <Image
          src={author.avatar || '/placeholder.svg'}
          alt={`${author.firstName} ${author.lastName}`}
          width={48}
          height={48}
          className="rounded-full mr-4"
        />
        <div>
          <p className="font-helvetica font-semibold">{`${author.firstName} ${author.lastName}`}</p>
          <p className="text-sm text-gray-600 font-mono">{author.email}</p>
        </div>
      </div>
      {forkedFromId && (
        <p className="mt-4 font-mono">
          Forked from:{' '}
          <Link href={`/editor?template=${forkedFromId}`} className="text-blue-500 hover:underline">
            Template #{forkedFromId}
          </Link>
        </p>
      )}
    </div>
  )
}


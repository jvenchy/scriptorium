import Link from 'next/link'

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
    <div className="mt-4">
      <h2 className="text-xl font-semibold mb-2">Author Information</h2>
      <div className="flex items-center">
        {author.avatar && (
          <img src={author.avatar} alt={`${author.firstName} ${author.lastName}`} className="w-10 h-10 rounded-full mr-4" />
        )}
        <div>
          <p className="font-semibold">{`${author.firstName} ${author.lastName}`}</p>
          <p className="text-sm text-gray-600">{author.email}</p>
        </div>
      </div>
      {forkedFromId && (
        <p className="mt-2">
          Forked from:{' '}
          <Link href={`/editor?template=${forkedFromId}`} className="text-blue-500 hover:underline">
            Template #{forkedFromId}
          </Link>
        </p>
      )}
    </div>
  )
}


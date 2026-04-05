'use client'
 
import { useState, useEffect } from 'react'

interface BeholdPost {
  id: string
  mediaUrl: string
  permalink: string
  mediaType: string
  thumbnailUrl?: string
}

interface InstaFeedProps {
  profile: 'coyotes' | 'baskferia'
}

export default function InstaFeed({ profile }: InstaFeedProps) {
  const [posts, setPosts] = useState<BeholdPost[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [profileName, setProfileName] = useState(profile === 'coyotes' ? 'coyotesdobasquetebol' : 'baskferia')

  const API_URL = `/api/instagram?profile=${profile}`
  const profileUrl = `https://instagram.com/${profileName}`

  useEffect(() => {
    async function fetchPosts() {
      try {
        const res = await fetch(API_URL)
        if (!res.ok) throw new Error('Falha ao carregar feed')
        const data = await res.json()
        
        // Se o Behold trouxer informação do usuário, usamos ela para o link do perfil
        // O Behold comumente retorna um objeto com { posts, user } ou um array direto
        if (data.user?.username) {
          setProfileName(data.user.username)
        } else if (!Array.isArray(data) && data.username) {
          setProfileName(data.username)
        }
        
        const finalPosts = Array.isArray(data) ? data : (data.posts || [])
        setPosts(finalPosts.slice(0, 6))
      } catch (err) {
        console.error('[Instagram] Erro:', err)
        setError(true)
      } finally {
        setLoading(false)
      }
    }
    fetchPosts()
  }, [API_URL])

  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 md:gap-3 mb-6 animate-pulse">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="aspect-square bg-b-stone/50" />
        ))}
      </div>
    )
  }

  if (error || posts.length === 0) {
    return (
      <div className="border border-dashed border-b-stone p-12 text-center">
        <p className="font-body text-gray-500 mb-6">Não foi possível carregar o feed agora.</p>
        <a
          href={profileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block font-display text-lg uppercase border-2 border-b-orange text-b-orange px-6 py-2"
        >
          Ver no Instagram (@{profileName})
        </a>
      </div>
    )
  }

  return (
    <div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 md:gap-3 mb-8">
        {posts.map((post) => (
          <a
            key={post.id}
            href={post.permalink}
            target="_blank"
            rel="noopener noreferrer"
            className="aspect-square relative overflow-hidden group bg-b-stone"
          >
            <img
              src={post.thumbnailUrl || post.mediaUrl}
              alt="Post do Instagram"
              className="object-cover w-full h-full grayscale group-hover:grayscale-0 scale-100 group-hover:scale-110 transition-all duration-500"
            />
            <div className="absolute inset-0 bg-b-orange/10 opacity-0 group-hover:opacity-100 transition-opacity" />
          </a>
        ))}
      </div>

      <div className="text-center">
        <a
          href={profileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block font-display text-lg uppercase border-2 border-b-orange text-b-orange px-8 py-3 tracking-wider hover:bg-b-orange hover:text-b-dark transition-all duration-200"
        >
          Seguir @{profileName} no Instagram
        </a>
      </div>
    </div>
  )
}

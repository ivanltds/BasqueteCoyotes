'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

interface Track {
  id: string
  name: string
  cloudinary_url: string
}

interface Props {
  tracks: Track[]
}

export default function AudioPlayer({ tracks }: Props) {
  const audioRef                = useRef<HTMLAudioElement>(null)
  const [idx, setIdx]           = useState(0)
  const [playing, setPlaying]   = useState(false)
  const [progress, setProgress] = useState(0)     // 0-1
  const [duration, setDuration] = useState(0)
  const [volume, setVolume]     = useState(0.8)   // 0-1
  const [muted, setMuted]       = useState(false)
  const [visible, setVisible]   = useState(true)

  const current = tracks[idx]

  // Troca de faixa
  useEffect(() => {
    const audio = audioRef.current
    if (!audio || !current) return
    audio.src = current.cloudinary_url
    audio.load()
    if (playing) audio.play().catch(() => {})
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idx])

  // Sincroniza volume/mute com o elemento de áudio
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    audio.volume = muted ? 0 : volume
  }, [volume, muted])

  const play  = () => { audioRef.current?.play();  setPlaying(true)  }
  const pause = () => { audioRef.current?.pause(); setPlaying(false) }

  const next = useCallback(() => {
    setIdx(i => (i + 1) % tracks.length)
  }, [tracks.length])

  const prev = () => setIdx(i => (i - 1 + tracks.length) % tracks.length)

  function seek(e: React.MouseEvent<HTMLDivElement>) {
    const audio = audioRef.current
    if (!audio || !duration) return
    const rect = e.currentTarget.getBoundingClientRect()
    audio.currentTime = ((e.clientX - rect.left) / rect.width) * duration
  }

  function handleVolume(e: React.ChangeEvent<HTMLInputElement>) {
    const v = parseFloat(e.target.value)
    setVolume(v)
    setMuted(v === 0)
  }

  function toggleMute() {
    setMuted(m => !m)
  }

  const effectiveVolume = muted ? 0 : volume

  if (!tracks.length || !visible) return null

  return (
    <>
      <audio
        ref={audioRef}
        onTimeUpdate={() => {
          const a = audioRef.current
          if (a && a.duration) setProgress(a.currentTime / a.duration)
        }}
        onLoadedMetadata={() => setDuration(audioRef.current?.duration ?? 0)}
        onEnded={next}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
      />

      {/* Mini-player flutuante */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-[min(560px,calc(100vw-2rem))] bg-b-dark/95 backdrop-blur border border-b-stone/40 shadow-2xl">

        {/* Barra de progresso (clicável) */}
        <div
          className="h-0.5 bg-b-stone/30 cursor-pointer relative"
          onClick={seek}
        >
          <div
            className="absolute inset-y-0 left-0 bg-b-orange transition-all"
            style={{ width: `${progress * 100}%` }}
          />
        </div>

        <div className="flex items-center gap-3 px-4 py-2.5">
          {/* Anterior / Play-Pause / Próxima */}
          <button
            onClick={prev}
            disabled={tracks.length <= 1}
            className="text-gray-500 hover:text-white disabled:opacity-20 transition-colors text-lg leading-none"
            aria-label="Anterior"
          >⏮</button>

          <button
            onClick={playing ? pause : play}
            className="w-8 h-8 flex items-center justify-center bg-b-orange text-b-dark hover:bg-b-orange/80 transition-colors shrink-0 text-base"
            aria-label={playing ? 'Pausar' : 'Tocar'}
          >
            {playing ? '⏸' : '▶'}
          </button>

          <button
            onClick={next}
            disabled={tracks.length <= 1}
            className="text-gray-500 hover:text-white disabled:opacity-20 transition-colors text-lg leading-none"
            aria-label="Próxima"
          >⏭</button>

          {/* Nome da faixa */}
          <div className="flex-1 min-w-0">
            <p className="font-mono text-xs text-b-orange uppercase tracking-widest truncate">
              {current?.name ?? ''}
            </p>
            {tracks.length > 1 && (
              <p className="font-mono text-[10px] text-gray-600">
                {idx + 1} / {tracks.length}
              </p>
            )}
          </div>

          {/* Volume: ícone mute + slider */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={toggleMute}
              className="text-gray-500 hover:text-white transition-colors text-sm leading-none w-4 text-center"
              aria-label={muted ? 'Ativar som' : 'Mutar'}
            >
              {effectiveVolume === 0 ? '🔇' : effectiveVolume < 0.5 ? '🔉' : '🔊'}
            </button>
            <input
              type="range"
              min={0}
              max={1}
              step={0.02}
              value={effectiveVolume}
              onChange={handleVolume}
              className="w-20 h-1 accent-b-orange cursor-pointer"
              aria-label="Volume"
            />
          </div>

          {/* Fechar */}
          <button
            onClick={() => { pause(); setVisible(false) }}
            className="text-gray-600 hover:text-white transition-colors text-sm leading-none ml-1"
            aria-label="Fechar player"
          >✕</button>
        </div>
      </div>
    </>
  )
}

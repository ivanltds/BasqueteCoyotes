'use client'

import Image from 'next/image'

const MONTHS = ['JAN','FEV','MAR','ABR','MAI','JUN','JUL','AGO','SET','OUT','NOV','DEZ']

export interface CarterinhaData {
  name: string
  height: string
  neighborhood: string
  city: string
  photo_url: string
  // Coyotes member
  started_month?: number
  started_year?: number
  // Baskferia participant
  edition?: number
  year?: number
}

interface Props {
  data: CarterinhaData
  type: 'coyotes' | 'baskferia'
  /** Se true, usa <img> em vez de next/image (necessário para html2canvas) */
  plain?: boolean
}

export default function Carteirinha({ data, type, plain = false }: Props) {
  const subtitle  = type === 'coyotes' ? 'Membro Oficial' : `${data.edition ?? 4}ª Edição · Participante`
  const teamLabel = type === 'coyotes' ? 'COYOTES' : 'BASKFERIA'
  const sinceLabel = type === 'coyotes' && data.started_month && data.started_year
    ? `${MONTHS[(data.started_month - 1)]}/${data.started_year}`
    : type === 'baskferia' ? `${data.year ?? 2026}` : ''

  const Img = plain
    ? ({ src, alt, className }: { src: string; alt: string; className?: string }) =>
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={alt} className={className} crossOrigin="anonymous" />
    : ({ src, alt, className }: { src: string; alt: string; className?: string }) =>
        <Image src={src} alt={alt} fill className={className} unoptimized />

  return (
    <div style={{
      width: '100%', maxWidth: 480,
      background: 'linear-gradient(135deg, #161616 0%, #2a2a2a 100%)',
      border: '2px solid #FF5722',
      borderRadius: 12,
      padding: '16px 20px',
      boxSizing: 'border-box',
      color: '#fff',
      fontFamily: 'sans-serif',
    }}>
      {/* Header */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start',
        borderBottom:'1px solid #444', paddingBottom:10, marginBottom:14 }}>
        <div>
          <div style={{ color:'#FF5722', fontSize:22, fontWeight:900, textTransform:'uppercase', letterSpacing:1 }}>
            {teamLabel}
          </div>
          <div style={{ fontSize:9, color:'#aaa', textTransform:'uppercase', letterSpacing:2, marginTop:2 }}>
            {subtitle}
          </div>
        </div>
        <div style={{ position:'relative', height:50, width:50 }}>
          {plain
            ? <img src="/images/logos/logo-coyotes.png" alt="Logo" style={{ height:50, width:'auto', objectFit:'contain' }} />
            : <Image src="/images/logos/logo-coyotes.png" alt="Logo" fill className="object-contain" />
          }
        </div>
      </div>

      {/* Body */}
      <div style={{ display:'flex', gap:16 }}>
        {/* Foto */}
        <div style={{ width:90, height:115, background:'#000', border:'2px solid #FF5722',
          borderRadius:6, flexShrink:0, overflow:'hidden', position:'relative' }}>
          {plain
            // eslint-disable-next-line @next/next/no-img-element
            ? <img src={data.photo_url} alt={data.name} crossOrigin="anonymous"
                style={{ width:'100%', height:'100%', objectFit:'cover' }} />
            : <Image src={data.photo_url} alt={data.name} fill className="object-cover" unoptimized />
          }
        </div>

        {/* Info */}
        <div style={{ display:'flex', flexDirection:'column', justifyContent:'space-between', flex:1 }}>
          <div>
            <div style={{ fontSize:8, color:'#FF5722', textTransform:'uppercase', fontWeight:700 }}>Nome</div>
            <div style={{ fontSize:15, color:'#f0f0f0', fontWeight:700, textTransform:'uppercase' }}>{data.name}</div>
          </div>
          <div style={{ display:'flex', gap:16 }}>
            <div>
              <div style={{ fontSize:8, color:'#FF5722', textTransform:'uppercase', fontWeight:700 }}>Altura</div>
              <div style={{ fontSize:13, color:'#f0f0f0', fontWeight:600, textTransform:'uppercase' }}>{data.height}</div>
            </div>
            <div>
              <div style={{ fontSize:8, color:'#FF5722', textTransform:'uppercase', fontWeight:700 }}>
                {type === 'coyotes' ? 'Desde' : 'Edição'}
              </div>
              <div style={{ fontSize:13, color:'#f0f0f0', fontWeight:600, textTransform:'uppercase' }}>{sinceLabel}</div>
            </div>
          </div>
          <div style={{ display:'flex', gap:16 }}>
            <div>
              <div style={{ fontSize:8, color:'#FF5722', textTransform:'uppercase', fontWeight:700 }}>Cidade</div>
              <div style={{ fontSize:13, color:'#f0f0f0', fontWeight:600, textTransform:'uppercase' }}>{data.city}</div>
            </div>
            <div>
              <div style={{ fontSize:8, color:'#FF5722', textTransform:'uppercase', fontWeight:700 }}>Bairro</div>
              <div style={{ fontSize:13, color:'#f0f0f0', fontWeight:600, textTransform:'uppercase' }}>{data.neighborhood}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

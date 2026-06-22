'use client'
// BaskferiaGrid é um alias de MatilhaGrid com type="baskferia"
import MatilhaGrid from './MatilhaGrid'
import type { CarterinhaData } from './Carteirinha'

interface Participant extends CarterinhaData { id: string }
interface Props { participants?: Participant[]; showJoinButton?: boolean }

export default function BaskferiaGrid({ participants = [], showJoinButton = false }: Props) {
  return <MatilhaGrid members={participants} type="baskferia" showJoinButton={showJoinButton} />
}

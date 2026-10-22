import { useSyncExternalStore } from 'react'
import type { CardColor } from '@/tokens'

export type Excerpt = {
  id: string
  cardId: string
  quote: string
  source: { file: string; page: number; paragraph: string }
  color: string
  createdAt: number
}

export type BoardCard = {
  id: string
  title: string
  lines: string[]
  color: CardColor
  excerpt?: Excerpt
}

let cards: BoardCard[] = []
let excerpts: Excerpt[] = []
const listeners = new Set<() => void>()

const emit = () => listeners.forEach((l) => l())

export const subscribeCards = (fn: () => void) => {
  listeners.add(fn)
  return () => listeners.delete(fn)
}

export const getCards = () => cards
export const getExcerpts = () => excerpts

export function addExcerptCard(input: {
  quote: string
  title: string
  source: Excerpt['source']
  color?: CardColor
}): BoardCard {
  const id = `X${cards.length + 1}`
  const card: BoardCard = {
    id,
    title: input.title || '未命名摘录',
    lines: [input.quote, `${input.source.file} · 第 ${input.source.page} 页`],
    color: input.color ?? 'yellow',
  }
  const excerpt: Excerpt = {
    id: `E${excerpts.length + 1}`,
    cardId: id,
    quote: input.quote,
    source: input.source,
    color: card.color,
    createdAt: Date.now(),
  }
  cards = [...cards, card]
  excerpts = [...excerpts, excerpt]
  emit()
  return card
}

export const useCards = () => useSyncExternalStore(subscribeCards, getCards, getCards)
export const useExcerpts = () => useSyncExternalStore(subscribeCards, getExcerpts, getExcerpts)

/** 板上视口位置：板 ↔ 卡往返时保留 */
let boardViewport: { x: number; y: number; zoom: number } | null = null
export const saveViewport = (v: { x: number; y: number; zoom: number }) => {
  boardViewport = v
}
export const loadViewport = () => boardViewport

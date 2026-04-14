import type { EmoteToken } from './types'

const emoteMap: Record<string, EmoteToken> = {
  Kappa: {
    provider: 'twitch',
    code: 'Kappa',
    url: 'https://static-cdn.jtvnw.net/emoticons/v2/25/default/dark/1.0',
  },
  Pog: {
    provider: '7tv',
    code: 'Pog',
    url: 'https://cdn.7tv.app/emote/60ae9596f7c927fad14e6ca2/1x.webp',
  },
  OMEGALUL: {
    provider: 'bttv',
    code: 'OMEGALUL',
    url: 'https://cdn.betterttv.net/emote/583089f47346937f445b1b6f/1x',
  },
  EZ: {
    provider: 'ffz',
    code: 'EZ',
    url: 'https://cdn.frankerfacez.com/emote/425196/1',
  },
}

export const parseEmotes = (content: string): EmoteToken[] => {
  const words = content.split(/\s+/)
  return words.flatMap((word) => {
    const hit = emoteMap[word]
    return hit ? [hit] : []
  })
}

import type { JSX } from 'react'

export type IconName =
  | 'inbox'
  | 'calendar'
  | 'board'
  | 'library'
  | 'tag'
  | 'highlight'
  | 'chat'
  | 'plus'
  | 'search'
  | 'cursor'
  | 'card'
  | 'upload'
  | 'link'
  | 'text'
  | 'frame'
  | 'more'
  | 'sun'
  | 'moon'
  | 'minus'
  | 'fit'
  | 'close'
  | 'chevronLeft'
  | 'chevronRight'
  | 'chevronDown'
  | 'check'
  | 'sparkles'
  | 'h2'
  | 'list'
  | 'todo'
  | 'quote'
  | 'code'
  | 'table'
  | 'image'
  | 'divider'
  | 'book'
  | 'pdf'

const PATHS: Record<IconName, JSX.Element> = {
  inbox: (
    <>
      <path d="M3 11.5 5 4.5h10l2 7v4.5H3z" />
      <path d="M3 11.5h4l1 2h4l1-2h4" />
    </>
  ),
  calendar: (
    <>
      <rect x="3.5" y="4.5" width="13" height="12" rx="2" />
      <path d="M3.5 8h13M7 3.5v2M13 3.5v2" />
      <path d="M7 11h2M11 11h2M7 14h2" />
    </>
  ),
  board: (
    <>
      <rect x="3" y="3.5" width="14" height="13" rx="2" />
      <path d="M6.5 10.5 9 8l2.5 3 2-1.5" />
    </>
  ),
  library: (
    <>
      <path d="M4 4.5h12v11H4z" />
      <path d="M4 8h12M4 11.5h12" />
    </>
  ),
  tag: (
    <>
      <path d="M4 4.5h5.2L15.5 10.8 10.8 15.5 4.5 9.2z" />
      <circle cx="7.2" cy="7.4" r="1" />
    </>
  ),
  highlight: (
    <>
      <path d="M5 15.5h10" />
      <path d="M6.5 12.5 5.5 9l6-6 3.5 3.5-6 6z" />
    </>
  ),
  chat: (
    <>
      <path d="M3.5 9.5c0-3 2.9-5 6.5-5s6.5 2 6.5 5-2.9 5-6.5 5c-.8 0-1.6-.1-2.3-.3L4 15.5l.8-2.7c-.8-.9-1.3-2-1.3-3.3z" />
    </>
  ),
  plus: <path d="M10 4.5v11M4.5 10h11" />,
  search: (
    <>
      <circle cx="9" cy="9" r="5" />
      <path d="m12.8 12.8 3.2 3.2" />
    </>
  ),
  cursor: <path d="M5.5 3.5 15 10l-4 1-1 4z" />,
  card: (
    <>
      <rect x="3.5" y="4.5" width="13" height="11" rx="2" />
      <path d="M6.5 8h7M6.5 11.5h4.5" />
    </>
  ),
  upload: (
    <>
      <path d="M10 13.5V4.5M6.5 8 10 4.5 13.5 8" />
      <path d="M4 13v2.5h12V13" />
    </>
  ),
  link: (
    <>
      <path d="M8.5 11.5 11.5 8.5" />
      <path d="M7 13.5 5.8 14.7a2.9 2.9 0 0 1-4.1-4.1L5 7.3" transform="translate(1.5 0)" />
      <path d="M13 6.5l1.2-1.2a2.9 2.9 0 0 1 4.1 4.1L15 12.7" transform="translate(-1.5 0)" />
    </>
  ),
  text: <path d="M5 5.5h10M10 5.5v9M7.5 14.5h5" />,
  frame: (
    <>
      <path d="M4 7.5h12M4 12.5h12M7.5 4v12M12.5 4v12" />
    </>
  ),
  more: (
    <>
      <circle cx="5" cy="10" r="1.1" />
      <circle cx="10" cy="10" r="1.1" />
      <circle cx="15" cy="10" r="1.1" />
    </>
  ),
  h2: (
    <>
      <path d="M4.5 5v10M9.5 5v10M4.5 10h5" />
      <path d="M13 8.2a2 2 0 0 1 3.4 1.4c0 1.6-3.4 2.6-3.4 5.4h3.6" />
    </>
  ),
  list: (
    <>
      <path d="M8 6h8M8 10h8M8 14h5" />
      <circle cx="5" cy="6" r="0.9" />
      <circle cx="5" cy="10" r="0.9" />
      <circle cx="5" cy="14" r="0.9" />
    </>
  ),
  todo: (
    <>
      <rect x="3.5" y="4.5" width="5" height="5" rx="1.2" />
      <path d="m4.6 7 1.2 1.2 2-2.2" />
      <path d="M11 7h5.5M11 13h5.5" />
      <rect x="3.5" y="10.5" width="5" height="5" rx="1.2" />
    </>
  ),
  quote: (
    <>
      <path d="M6.5 6.5H4v4h3.5V8.2c0 2-1 3-2.5 3.6" />
      <path d="M14.5 6.5H12v4h3.5V8.2c0 2-1 3-2.5 3.6" />
    </>
  ),
  code: <path d="m7.5 7-3 3 3 3M12.5 7l3 3-3 3" />,
  table: (
    <>
      <rect x="3.5" y="4.5" width="13" height="11" rx="1.5" />
      <path d="M3.5 8.5h13M8.5 8.5v7M12.5 8.5v7" />
    </>
  ),
  image: (
    <>
      <rect x="3.5" y="4.5" width="13" height="11" rx="1.5" />
      <circle cx="7.3" cy="8.2" r="1.1" />
      <path d="m4.5 14 3.6-3.6 2.4 2.4 1.8-1.6 3.2 3" />
    </>
  ),
  divider: (
    <>
      <path d="M3.5 10h13" />
      <circle cx="6" cy="10" r="0.8" fill="currentColor" />
      <circle cx="10" cy="10" r="0.8" fill="currentColor" />
      <circle cx="14" cy="10" r="0.8" fill="currentColor" />
    </>
  ),
  book: (
    <>
      <path d="M4 5.5c2-1 4-1 6 0v10c-2-1-4-1-6 0z" />
      <path d="M16 5.5c-2-1-4-1-6 0v10c2-1 4-1 6 0z" />
    </>
  ),
  pdf: (
    <>
      <path d="M5 3.5h6.5L15 7v9.5H5z" />
      <path d="M11.5 3.5V7H15" />
      <path d="M7.5 12.5h5M7.5 9.5h2.5" />
    </>
  ),
  sun: (
    <>
      <circle cx="10" cy="10" r="3.2" />
      <path d="M10 3v1.6M10 15.4V17M3 10h1.6M15.4 10H17M5 5l1.1 1.1M13.9 13.9 15 15M15 5l-1.1 1.1M6.1 13.9 5 15" />
    </>
  ),
  moon: <path d="M15.5 11.5A6 6 0 0 1 8.5 4.5a6 6 0 1 0 7 7z" />,
  minus: <path d="M4.5 10h11" />,
  fit: (
    <>
      <path d="M4 7.5V4.5h3M16 7.5V4.5h-3M4 12.5v3h3M16 12.5v3h-3" />
    </>
  ),
  close: <path d="m5.5 5.5 9 9M14.5 5.5l-9 9" />,
  chevronLeft: <path d="m12 5-5 5 5 5" />,
  chevronRight: <path d="m8 5 5 5-5 5" />,
  chevronDown: <path d="m5 8 5 5 5-5" />,
  check: <path d="m4.5 10.5 3.5 3.5 7.5-8" />,
  sparkles: (
    <>
      <path d="M8 3.5 9.2 7 12.5 8.2 9.2 9.4 8 12.9 6.8 9.4 3.5 8.2 6.8 7z" />
      <path d="M14 11.5l.8 2 2 .8-2 .8-.8 2-.8-2-2-.8 2-.8z" />
    </>
  ),
}

export function Icon({
  name,
  size = 20,
  className,
}: {
  name: IconName
  size?: number
  className?: string
}): JSX.Element {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {PATHS[name]}
    </svg>
  )
}

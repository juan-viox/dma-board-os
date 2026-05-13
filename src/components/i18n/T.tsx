/**
 * <T en="Hello" es="Hola" /> — minimal bilingual text component.
 * Renders both spans; CSS hides the inactive one via html[data-lang] selector.
 */
import { ReactNode } from 'react'

export function T({ en, es }: { en: ReactNode; es: ReactNode }) {
  return (
    <>
      <span data-en>{en}</span>
      <span data-es>{es}</span>
    </>
  )
}

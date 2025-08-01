import { DependencyList, useEffect } from "react"

export function useActiveEffect(
  effect: (getActive: () => boolean) => void,
  dependencies: DependencyList
) {
  return useEffect(() => {
    let active = true

    effect(() => active)

    return () => {
      active = false
    }
  }, dependencies)
}

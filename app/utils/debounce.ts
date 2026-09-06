interface DebouncedTask<Arguments extends unknown[]> {
  schedule: (...args: Arguments) => void
  flush: () => void
  cancel: () => void
}

export const createDebouncedTask = <Arguments extends unknown[]>(
  task: (...args: Arguments) => void,
  delay: number,
): DebouncedTask<Arguments> => {
  let timeout: ReturnType<typeof setTimeout> | undefined
  let pendingArguments: Arguments | undefined

  const invoke = (): void => {
    const args = pendingArguments
    timeout = undefined
    pendingArguments = undefined

    if (args) task(...args)
  }

  const cancel = (): void => {
    if (timeout !== undefined) clearTimeout(timeout)
    timeout = undefined
    pendingArguments = undefined
  }

  const schedule = (...args: Arguments): void => {
    if (timeout !== undefined) clearTimeout(timeout)
    pendingArguments = args
    timeout = setTimeout(invoke, delay)
  }

  const flush = (): void => {
    if (timeout === undefined) return
    clearTimeout(timeout)
    invoke()
  }

  return { schedule, flush, cancel }
}

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { createDebouncedTask } from './debounce'

describe('createDebouncedTask', () => {
  beforeEach(() => vi.useFakeTimers())

  afterEach(() => {
    vi.clearAllTimers()
    vi.useRealTimers()
  })

  it('runs once with the latest arguments after the delay', () => {
    const task = vi.fn<(value: string) => void>()
    const debouncedTask = createDebouncedTask(task, 300)

    debouncedTask.schedule('first')
    vi.advanceTimersByTime(200)
    debouncedTask.schedule('second')
    vi.advanceTimersByTime(299)
    expect(task).not.toHaveBeenCalled()

    vi.advanceTimersByTime(1)
    expect(task).toHaveBeenCalledOnce()
    expect(task).toHaveBeenCalledWith('second')
  })

  it('flushes a pending task immediately and only once', () => {
    const task = vi.fn()
    const debouncedTask = createDebouncedTask(task, 300)

    debouncedTask.schedule()
    debouncedTask.flush()
    vi.advanceTimersByTime(300)

    expect(task).toHaveBeenCalledOnce()
  })

  it('cancels a pending task', () => {
    const task = vi.fn()
    const debouncedTask = createDebouncedTask(task, 300)

    debouncedTask.schedule()
    debouncedTask.cancel()
    vi.advanceTimersByTime(300)

    expect(task).not.toHaveBeenCalled()
  })
})

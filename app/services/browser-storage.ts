type Validator<Value> = (value: unknown) => value is Value

const getBrowserStorage = (): Storage | null => {
  if (typeof window === 'undefined') {
    return null
  }

  try {
    return window.localStorage
  } catch {
    return null
  }
}

export const readStorageItem = <Value>(key: string, isValid: Validator<Value>): Value | null => {
  const storage = getBrowserStorage()

  if (!storage) {
    return null
  }

  try {
    const serializedValue = storage.getItem(key)

    if (!serializedValue) {
      return null
    }

    const value: unknown = JSON.parse(serializedValue)
    return isValid(value) ? value : null
  } catch {
    return null
  }
}

export const writeStorageItem = (key: string, value: unknown): void => {
  const storage = getBrowserStorage()

  if (!storage) {
    return
  }

  try {
    storage.setItem(key, JSON.stringify(value))
  } catch {
    // Storage can be unavailable or full. The in-memory state remains usable.
  }
}

export const removeStorageItem = (key: string): void => {
  const storage = getBrowserStorage()

  if (!storage) {
    return
  }

  try {
    storage.removeItem(key)
  } catch {
    // There is no recovery action if storage cannot be modified.
  }
}

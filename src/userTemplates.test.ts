import { describe, expect, it, beforeEach } from 'vitest'
import {
  deleteUserTemplate,
  loadUserTemplates,
  saveUserTemplate,
} from './userTemplates.ts'
import { initialStyle } from './qrStyle.ts'

const memory = new Map<string, string>()

beforeEach(() => {
  memory.clear()
  Object.defineProperty(globalThis, 'localStorage', {
    configurable: true,
    value: {
      getItem: (key: string) => memory.get(key) ?? null,
      setItem: (key: string, value: string) => { memory.set(key, value) },
      removeItem: (key: string) => { memory.delete(key) },
    },
  })
})

describe('userTemplates', () => {
  it('starts empty', () => {
    expect(loadUserTemplates()).toHaveLength(0)
  })

  it('saves and loads a template', () => {
    saveUserTemplate('My Template', initialStyle)
    const templates = loadUserTemplates()
    expect(templates).toHaveLength(1)
    expect(templates[0]!.name).toBe('My Template')
    expect(templates[0]!.patch).toBeDefined()
  })

  it('deletes a template', () => {
    saveUserTemplate('Delete Me', initialStyle)
    const [template] = loadUserTemplates()
    deleteUserTemplate(template!.id)
    expect(loadUserTemplates()).toHaveLength(0)
  })

  it('lists newest first', () => {
    saveUserTemplate('First', initialStyle)
    saveUserTemplate('Second', initialStyle)
    const templates = loadUserTemplates()
    expect(templates[0]!.name).toBe('Second')
    expect(templates[1]!.name).toBe('First')
  })
})

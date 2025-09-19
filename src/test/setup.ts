import '@testing-library/jest-dom'
import { cleanup } from '@testing-library/react'
import { afterEach, vi, beforeAll, afterAll } from 'vitest'

// Polyfills robustes pour jsdom et animations
if (typeof Element !== 'undefined') {
  Element.prototype.getAnimations = Element.prototype.getAnimations || (() => [])
}

// Polyfills pour jsdom et GitHub Actions
global.Headers = global.Headers || class Headers {
  private headers: Record<string, string> = {}
  
  constructor(init?: HeadersInit) {
    if (init) {
      if (Array.isArray(init)) {
        init.forEach(([key, value]) => this.headers[key.toLowerCase()] = value)
      } else if (init instanceof Headers) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (init as any).forEach((value: string, key: string) => {
          this.headers[key.toLowerCase()] = value
        })
      } else {
        Object.entries(init).forEach(([key, value]) => {
          this.headers[key.toLowerCase()] = value
        })
      }
    }
  }
  
  append(name: string, value: string) {
    this.headers[name.toLowerCase()] = value
  }
  
  delete(name: string) {
    delete this.headers[name.toLowerCase()]
  }
  
  get(name: string) {
    return this.headers[name.toLowerCase()] || null
  }
  
  has(name: string) {
    return name.toLowerCase() in this.headers
  }
  
  set(name: string, value: string) {
    this.headers[name.toLowerCase()] = value
  }
  
  forEach(callback: (value: string, key: string) => void) {
    Object.entries(this.headers).forEach(([key, value]) => callback(value, key))
  }
}

// Polyfill pour Request/Response si nécessaire
if (!global.Request) {
  global.Request = class Request {
    url: string
    init?: RequestInit
    headers = new Headers()
    
    constructor(url: string, init?: RequestInit) {
      this.url = url
      this.init = init
    }
  } as any
}

if (!global.Response) {
  global.Response = class Response {
    body?: BodyInit
    init?: ResponseInit
    headers = new Headers()
    ok = true
    status = 200
    statusText = 'OK'
    
    constructor(body?: BodyInit, init?: ResponseInit) {
      this.body = body
      this.init = init
    }
  } as any
}

// Nettoyer après chaque test
afterEach(() => {
  cleanup()
})

// Mock de window.matchMedia pour les tests
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

// Mock de window.location
Object.defineProperty(window, 'location', {
  value: {
    href: 'http://localhost:3000',
    origin: 'http://localhost:3000',
    protocol: 'http:',
    host: 'localhost:3000',
    hostname: 'localhost',
    port: '3000',
    pathname: '/',
    search: '',
    hash: '',
    assign: vi.fn(),
    reload: vi.fn(),
    replace: vi.fn(),
  },
  writable: true,
})

// Mock des notifications
const mockNotification = vi.fn().mockImplementation(() => ({
  close: vi.fn()
}))
Object.defineProperty(global, 'Notification', {
  value: mockNotification,
  writable: true
})

// Supprimer les warnings React 18
const originalError = console.error
beforeAll(() => {
  console.error = (...args) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('Warning: ReactDOM.render is deprecated')
    ) {
      return
    }
    originalError.call(console, ...args)
  }
})

afterAll(() => {
  console.error = originalError
})
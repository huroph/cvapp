import { render, type RenderOptions } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { type ReactElement, type ReactNode } from 'react'
import { vi } from 'vitest'
import { mockAuthContext, mockCVContext, mockProfileContext } from './mocks/contexts'

// Mock de react-hot-toast
export const mockToast = {
  success: vi.fn(),
  error: vi.fn(),
  loading: vi.fn(),
  dismiss: vi.fn()
}

// Options de rendu personnalisées
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  authValue?: Partial<typeof mockAuthContext>
  cvValue?: Partial<typeof mockCVContext>
  profileValue?: Partial<typeof mockProfileContext>
  route?: string
}

// Fonction de rendu personnalisée avec tous les providers
export const renderWithProviders = (
  ui: ReactElement,
  options: CustomRenderOptions = {}
) => {
  const {
    authValue = {},
    cvValue = {},
    profileValue = {},
    route = '/',
    ...renderOptions
  } = options

  // Mock du contexte Auth
  const authContextValue = { ...mockAuthContext, ...authValue }
  
  // Mock du contexte CV
  const cvContextValue = { ...mockCVContext, ...cvValue }
  
  // Mock du contexte Profile
  const profileContextValue = { ...mockProfileContext, ...profileValue }

  // Set l'URL de test
  if (route !== '/') {
    window.history.pushState({}, 'Test page', route)
  }

  const Wrapper = ({ children }: { children: ReactNode }) => {
    return (
      <BrowserRouter>
        <div 
          data-testid="test-providers"
          data-auth={JSON.stringify(authContextValue)}
          data-cv={JSON.stringify(cvContextValue)}
          data-profile={JSON.stringify(profileContextValue)}
        >
          {children}
        </div>
      </BrowserRouter>
    )
  }

  return render(ui, { wrapper: Wrapper, ...renderOptions })
}

// Fonctions helper pour les tests
export const waitForElement = async (getByTestId: any, testId: string, timeout = 1000) => {
  return new Promise((resolve, reject) => {
    const startTime = Date.now()
    const check = () => {
      try {
        const element = getByTestId(testId)
        resolve(element)
      } catch (error) {
        if (Date.now() - startTime >= timeout) {
          reject(new Error(`Element with testId "${testId}" not found within ${timeout}ms`))
        } else {
          setTimeout(check, 50)
        }
      }
    }
    check()
  })
}

export const mockNavigation = {
  navigate: vi.fn(),
  location: { pathname: '/', search: '', hash: '', state: null, key: 'test' },
  params: {}
}

// Mock de useNavigate
export const createMockNavigate = () => {
  const navigate = vi.fn()
  return { navigate, mockNavigate: navigate }
}

// Données de test commune
export const testUser = {
  uid: 'test-user-123',
  email: 'test@example.com',
  displayName: 'Test User'
}

export const testCV = {
  id: 'test-cv-123',
  userId: 'test-user-123',
  basicInfo: {
    title: 'Mon CV Test',
    firstName: 'Jean',
    lastName: 'Dupont',
    position: 'Développeur React',
    email: 'jean.dupont@test.com',
    phone: '0123456789',
    location: 'Paris, France'
  },
  formations: [],
  skills: [],
  experiences: [],
  createdAt: new Date('2023-01-01'),
  updatedAt: new Date('2023-01-01')
}
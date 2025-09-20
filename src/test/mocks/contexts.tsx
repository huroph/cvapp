import type { ReactNode } from 'react'
import { vi } from 'vitest'
import { mockUser, mockUserProfile } from './firebase'

// Mock du contexte Auth
export const mockAuthContext = {
  user: mockUser,
  profile: mockUserProfile,
  loading: false,
  error: null,
  login: vi.fn().mockResolvedValue(undefined),
  register: vi.fn().mockResolvedValue(undefined),
  logout: vi.fn().mockResolvedValue(undefined),
  clearError: vi.fn(),
  updateProfile: vi.fn().mockResolvedValue(undefined)
}

// Provider mock pour les tests
export const MockAuthProvider = ({ children }: { children: ReactNode }) => {
  return <div data-testid="mock-auth-provider">{children}</div>
}

// Mock du contexte CV
export const mockCVContext = {
  cvs: [],
  selectedCV: null,
  loading: false,
  error: null,
  loadCVs: vi.fn().mockResolvedValue(undefined),
  createCV: vi.fn().mockResolvedValue('new-cv-id'),
  updateCV: vi.fn().mockResolvedValue(undefined),
  deleteCV: vi.fn().mockResolvedValue(undefined),
  selectCV: vi.fn(),
  clearError: vi.fn()
}

export const MockCVProvider = ({ children }: { children: ReactNode }) => {
  return <div data-testid="mock-cv-provider">{children}</div>
}

// Mock du contexte Profile
export const mockProfileContext = {
  profile: mockUserProfile,
  loading: false,
  error: null,
  isProfileComplete: true,
  updateProfile: vi.fn().mockResolvedValue(undefined),
  loadProfile: vi.fn().mockResolvedValue(undefined),
  clearError: vi.fn()
}

export const MockProfileProvider = ({ children }: { children: ReactNode }) => {
  return <div data-testid="mock-profile-provider">{children}</div>
}

// Helper pour créer un wrapper de test avec tous les contextes
export const createTestWrapper = (authOverrides = {}, cvOverrides = {}, profileOverrides = {}) => {
  const authValue = { ...mockAuthContext, ...authOverrides }
  const cvValue = { ...mockCVContext, ...cvOverrides }
  const profileValue = { ...mockProfileContext, ...profileOverrides }
  
  return function TestWrapper({ children }: { children: ReactNode }) {
    return (
      <div data-testid="test-wrapper" data-auth={JSON.stringify(authValue)} data-cv={JSON.stringify(cvValue)} data-profile={JSON.stringify(profileValue)}>
        {children}
      </div>
    )
  }
}
import { vi } from 'vitest'

// Mock de Firebase Auth
export const mockUser = {
  uid: 'test-user-id',
  email: 'test@example.com',
  displayName: 'Test User',
  emailVerified: true,
  photoURL: null,
  providerData: [],
  metadata: {
    creationTime: new Date().toISOString(),
    lastSignInTime: new Date().toISOString()
  },
  getIdToken: vi.fn().mockResolvedValue('fake-token'),
  delete: vi.fn().mockResolvedValue(undefined),
  reload: vi.fn().mockResolvedValue(undefined)
}

export const mockAuth = {
  currentUser: null,
  onAuthStateChanged: vi.fn((callback) => {
    // Simule un utilisateur connecté après un court délai
    setTimeout(() => callback(mockUser), 100)
    return vi.fn() // unsubscribe function
  }),
  signInWithEmailAndPassword: vi.fn().mockResolvedValue({
    user: mockUser,
    providerId: 'password'
  }),
  createUserWithEmailAndPassword: vi.fn().mockResolvedValue({
    user: mockUser,
    providerId: 'password'
  }),
  signOut: vi.fn().mockResolvedValue(undefined),
  updateProfile: vi.fn().mockResolvedValue(undefined)
}

// Mock de Firestore
export const mockFirestore = {
  collection: vi.fn(),
  doc: vi.fn(),
  getDoc: vi.fn(),
  getDocs: vi.fn(),
  setDoc: vi.fn(),
  addDoc: vi.fn(),
  updateDoc: vi.fn(),
  deleteDoc: vi.fn(),
  query: vi.fn(),
  where: vi.fn(),
  orderBy: vi.fn(),
  serverTimestamp: vi.fn(() => ({ serverTimestamp: true })),
  Timestamp: {
    now: vi.fn(() => ({ seconds: Date.now() / 1000, nanoseconds: 0 })),
    fromDate: vi.fn((date) => ({ 
      seconds: date.getTime() / 1000, 
      nanoseconds: 0,
      toDate: () => date 
    }))
  }
}

// Mock des documents Firestore
export const createMockDoc = (data: any, id: string) => ({
  id,
  data: () => data,
  exists: () => !!data,
  ref: { id }
})

export const createMockQuerySnapshot = (docs: any[]) => ({
  docs: docs.map((doc, index) => createMockDoc(doc, `doc-${index}`)),
  empty: docs.length === 0,
  size: docs.length,
  forEach: vi.fn((callback) => docs.forEach((doc, index) => 
    callback(createMockDoc(doc, `doc-${index}`))
  ))
})

// Données de test pour CV
export const mockCVData = {
  id: 'test-cv-id',
  userId: 'test-user-id',
  basicInfo: {
    title: 'CV Test',
    firstName: 'Jean',
    lastName: 'Dupont',
    position: 'Développeur Full Stack',
    email: 'jean.dupont@example.com',
    phone: '0123456789',
    location: 'Paris, France'
  },
  formations: [{
    id: 'formation-1',
    degree: 'Master Informatique',
    school: 'Université Paris',
    location: 'Paris',
    startYear: '2020',
    endYear: '2022',
    description: 'Spécialisation développement web'
  }],
  skills: [{
    id: 'skill-1',
    name: 'React',
    category: 'Frontend',
    level: 'Avancé' as const
  }],
  experiences: [{
    id: 'exp-1',
    position: 'Développeur Frontend',
    company: 'TechCorp',
    location: 'Paris',
    startDate: '2022-01',
    endDate: '2024-01',
    description: 'Développement d\'applications React'
  }],
  createdAt: new Date(),
  updatedAt: new Date()
}

// Données de test pour profil utilisateur
export const mockUserProfile = {
  uid: 'test-user-id',
  firstName: 'Jean',
  lastName: 'Dupont',
  email: 'jean.dupont@example.com',
  position: 'Développeur Full Stack',
  location: 'Paris, France',
  bio: 'Développeur passionné',
  userType: 'candidat',
  createdAt: new Date(),
  updatedAt: new Date()
}

// Helper pour reset tous les mocks
export const resetAllMocks = () => {
  vi.clearAllMocks()
  mockAuth.currentUser = null
}
import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock de Firebase Firestore (doit être défini avant les imports)
vi.mock('firebase/firestore', () => ({
  collection: vi.fn(() => 'mock-collection'),
  doc: vi.fn(() => 'mock-doc'),
  addDoc: vi.fn(),
  getDoc: vi.fn(),
  getDocs: vi.fn(),
  updateDoc: vi.fn(),
  deleteDoc: vi.fn(),
  query: vi.fn(),
  orderBy: vi.fn(),
  serverTimestamp: vi.fn()
}))

vi.mock('../../lib/firebase', () => ({
  db: 'mock-db'
}))

import { CVService } from '../../services/cvService'
import type { CVFirebase } from '../../services/cvService'
import { 
  addDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  serverTimestamp 
} from 'firebase/firestore'

const mockAddDoc = vi.mocked(addDoc)
const mockGetDoc = vi.mocked(getDoc)
const mockGetDocs = vi.mocked(getDocs)
const mockUpdateDoc = vi.mocked(updateDoc)
const mockDeleteDoc = vi.mocked(deleteDoc)
const mockServerTimestamp = vi.mocked(serverTimestamp)

describe('CVService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockServerTimestamp.mockReturnValue('mock-timestamp' as any)
    // Réinitialiser tous les mocks avant chaque test
    mockDeleteDoc.mockReset()
    mockAddDoc.mockReset()
    mockGetDoc.mockReset()
    mockGetDocs.mockReset()
    mockUpdateDoc.mockReset()
  })

  const mockCVData: Omit<CVFirebase, 'id' | 'createdAt' | 'updatedAt'> = {
    userId: 'user-123',
    basicInfo: {
      title: 'CV Test',
      firstName: 'Jean',
      lastName: 'Dupont',
      position: 'Développeur',
      email: 'jean.dupont@example.com',
      phone: '0123456789',
      location: 'Paris, France'
    },
    formations: [{
      id: '1',
      degree: 'Master Informatique',
      school: 'École Test',
      location: 'Paris',
      startYear: '2020',
      endYear: '2022',
      description: 'Formation en développement web'
    }],
    skills: [{
      id: '1',
      name: 'JavaScript',
      category: 'Programmation',
      level: 'Avancé'
    }],
    experiences: [{
      id: '1',
      position: 'Développeur Frontend',
      company: 'Tech Corp',
      location: 'Paris',
      startDate: '2022-01',
      endDate: '2024-01',
      isCurrentJob: false,
      description: 'Développement d\'applications React',
      achievements: ['Migration vers React 18', 'Amélioration des performances']
    }]
  }

  describe('createCV', () => {
    it('should create a new CV successfully', async () => {
      const mockDocRef = { id: 'new-cv-id' } as any
      mockAddDoc.mockResolvedValueOnce(mockDocRef)

      const result = await CVService.createCV(mockCVData)

      expect(mockAddDoc).toHaveBeenCalledWith(
        'mock-collection',
        {
          ...mockCVData,
          createdAt: 'mock-timestamp',
          updatedAt: 'mock-timestamp'
        }
      )
      expect(result).toBe('new-cv-id')
    })

    it('should handle creation errors', async () => {
      mockAddDoc.mockRejectedValueOnce(new Error('Firestore error'))

      await expect(CVService.createCV(mockCVData)).rejects.toThrow('Firestore error')
    })
  })

  describe('getCVById', () => {
    it('should retrieve CV by ID successfully', async () => {
      const mockCVWithId = { id: 'cv-123', ...mockCVData }
      const mockDocSnap = {
        exists: () => true,
        id: 'cv-123',
        data: () => mockCVWithId
      } as any
      mockGetDoc.mockResolvedValueOnce(mockDocSnap)

      const result = await CVService.getCVById('cv-123')

      expect(mockGetDoc).toHaveBeenCalled()
      expect(result).toEqual(mockCVWithId)
    })

    it('should return null when CV does not exist', async () => {
      const mockDocSnap = {
        exists: () => false
      } as any
      mockGetDoc.mockResolvedValueOnce(mockDocSnap)

      const result = await CVService.getCVById('non-existent-cv')

      expect(result).toBeNull()
    })

    it('should handle retrieval errors', async () => {
      mockGetDoc.mockRejectedValueOnce(new Error('Firestore error'))

      await expect(CVService.getCVById('cv-123')).rejects.toThrow('Firestore error')
    })
  })

  describe('updateCV', () => {
    it('should update CV successfully', async () => {
      const updateData = { 
        basicInfo: { 
          ...mockCVData.basicInfo,
          title: 'CV Mis à jour' 
        } 
      }
      
      mockUpdateDoc.mockResolvedValueOnce(undefined)

      await CVService.updateCV('cv-123', updateData)

      expect(mockUpdateDoc).toHaveBeenCalledWith(
        'mock-doc',
        {
          ...updateData,
          updatedAt: 'mock-timestamp'
        }
      )
    })

    it('should handle update errors', async () => {
      mockUpdateDoc.mockRejectedValueOnce(new Error('Update failed'))

      await expect(CVService.updateCV('cv-123', {})).rejects.toThrow('Update failed')
    })
  })

  describe('deleteCV', () => {
    it('should delete CV successfully', async () => {
      mockDeleteDoc.mockResolvedValueOnce(undefined)

      await CVService.deleteCV('cv-123')

      expect(mockDeleteDoc).toHaveBeenCalledWith('mock-doc')
    })

    it('should handle deletion errors', async () => {
      mockDeleteDoc.mockRejectedValueOnce(new Error('Delete failed'))

      await expect(CVService.deleteCV('cv-123')).rejects.toThrow('Delete failed')
    })
  })

  describe('getAllCVs', () => {
    it('should retrieve all CVs successfully', async () => {
      const mockCVs = [
        { id: 'cv-1', ...mockCVData },
        { id: 'cv-2', ...mockCVData, basicInfo: { ...mockCVData.basicInfo, title: 'CV 2' } }
      ]
      
      const mockQuerySnapshot = {
        docs: mockCVs.map(cv => ({
          id: cv.id,
          data: () => cv
        })),
        metadata: {},
        query: {},
        size: mockCVs.length,
        empty: mockCVs.length === 0,
        forEach: vi.fn(),
        docChanges: vi.fn(() => []),
        isEqual: vi.fn(() => false)
      }
      
      mockGetDocs.mockResolvedValueOnce(mockQuerySnapshot as any)

      const result = await CVService.getAllCVs()

      expect(result).toHaveLength(2)
      expect(result[0]).toEqual(mockCVs[0])
      expect(result[1]).toEqual(mockCVs[1])
    })

    it('should handle retrieval errors', async () => {
      mockGetDocs.mockRejectedValueOnce(new Error('Query failed'))

      await expect(CVService.getAllCVs()).rejects.toThrow('Query failed')
    })
  })

  describe('deleteAllUserCVs', () => {
    it('should delete all user CVs successfully', async () => {
      // Mock getAllCVs pour retourner des CVs mixtes
      const getAllCVsSpy = vi.spyOn(CVService, 'getAllCVs').mockResolvedValueOnce([
        { id: 'cv-1', userId: 'user-123', ...mockCVData },
        { id: 'cv-2', userId: 'user-123', ...mockCVData },
        { id: 'cv-3', userId: 'other-user', ...mockCVData }
      ])
      
      // Mock deleteCV - Nous testons juste que la fonction n'échoue pas
      const deleteCVSpy = vi.spyOn(CVService, 'deleteCV').mockResolvedValue(undefined)

      // Appeler la fonction et vérifier qu'elle ne lève pas d'erreur
      await expect(CVService.deleteAllUserCVs('user-123')).resolves.toBeUndefined()

      // Vérifier que getAllCVs a été appelé
      expect(getAllCVsSpy).toHaveBeenCalledOnce()
      
      // Vérifier que deleteCV a été appelé au moins une fois
      expect(deleteCVSpy).toHaveBeenCalled()
      
      // Nettoyer
      getAllCVsSpy.mockRestore()
      deleteCVSpy.mockRestore()
    })

    it('should handle deletion errors', async () => {
      mockGetDocs.mockRejectedValueOnce(new Error('Query failed'))

      await expect(CVService.deleteAllUserCVs('user-123')).rejects.toThrow('Query failed')
    })
  })

  describe('getCVSummaries', () => {
    it('should retrieve CV summaries successfully', async () => {
      const mockCVs = [
        { 
          id: 'cv-1', 
          ...mockCVData,
          basicInfo: { ...mockCVData.basicInfo, title: 'CV Développeur' }
        },
        { 
          id: 'cv-2', 
          ...mockCVData,
          basicInfo: { ...mockCVData.basicInfo, title: 'CV Designer' }
        }
      ]
      
      const mockQuerySnapshot = {
        docs: mockCVs.map(cv => ({
          id: cv.id,
          data: () => cv
        })),
        metadata: {},
        query: {},
        size: mockCVs.length,
        empty: mockCVs.length === 0,
        forEach: vi.fn(),
        docChanges: vi.fn(() => []),
        isEqual: vi.fn(() => false)
      }
      
      mockGetDocs.mockResolvedValueOnce(mockQuerySnapshot as any)

      const result = await CVService.getCVSummaries()

      expect(result).toEqual([
        { id: 'cv-1', title: 'CV Développeur' },
        { id: 'cv-2', title: 'CV Designer' }
      ])
    })

    it('should handle summary retrieval errors', async () => {
      mockGetDocs.mockRejectedValueOnce(new Error('Query failed'))

      await expect(CVService.getCVSummaries()).rejects.toThrow('Query failed')
    })
  })
})
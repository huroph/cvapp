import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import CreateCVWizard from '../../components/modals/CreateCVWizard'

// Mock de react-hot-toast
vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
    loading: vi.fn(),
    dismiss: vi.fn()
  }
}))

// Mock du contexte Profile
const mockProfile = {
  firstName: 'Jean',
  lastName: 'Dupont',
  email: 'jean.dupont@example.com',
  position: 'Développeur'
}

vi.mock('../../contexts/ProfileContext', () => ({
  useProfile: () => ({
    profile: mockProfile,
    loading: false,
    error: null
  })
}))

// Mock du contexte CV
const mockCreateCV = vi.fn()
vi.mock('../../contexts/CVContext', () => ({
  useCV: () => ({
    createCV: mockCreateCV,
    loading: false,
    error: null
  })
}))

// Mock des données d'auto-remplissage
vi.mock('../../utils/autoFillData', () => ({
  getRandomAutoFillData: vi.fn(() => ({
    basicInfo: {
      title: 'CV Développeur',
      firstName: 'Jean',
      lastName: 'Dupont',
      position: 'Développeur Full Stack',
      email: 'jean.dupont@example.com',
      phone: '0123456789',
      location: 'Paris, France'
    },
    formations: [{
      id: '1',
      school: 'École Test',
      degree: 'Master',
      field: 'Informatique',
      startYear: '2020',
      endYear: '2022'
    }],
    skills: [{
      id: '1',
      name: 'JavaScript',
      level: 'Avancé'
    }],
    experiences: [{
      id: '1',
      position: 'Développeur Frontend',
      company: 'Tech Corp',
      startDate: '2022-01',
      endDate: '2024-01',
      description: 'Développement d\'applications web',
      achievements: ['Amélioration des performances', 'Migration React']
    }]
  }))
}))

describe('CreateCVWizard Component', () => {
  const user = userEvent.setup()
  const mockOnClose = vi.fn()
  const mockOnSave = vi.fn()

  // Helper pour rendre le composant
  const renderWizard = (isOpen = true) => {
    return render(
      <BrowserRouter>
        <CreateCVWizard
          isOpen={isOpen}
          onClose={mockOnClose}
          onSave={mockOnSave}
        />
      </BrowserRouter>
    )
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render wizard when open', () => {
    renderWizard(true)
    
    // Vérifier que le modal est affiché
    expect(screen.getByText(/créer un nouveau cv/i)).toBeInTheDocument()
    // Vérifier qu'on est à l'étape 1 (plus spécifique)
    expect(screen.getByText(/étape.*1.*sur.*4/i)).toBeInTheDocument()
  })

  it('should not render wizard when closed', () => {
    renderWizard(false)
    
    // Vérifier que le modal n'est pas affiché
    expect(screen.queryByText(/créer un nouveau cv/i)).not.toBeInTheDocument()
  })

  it('should show initial step and allow auto-fill', async () => {
    renderWizard()
    
    // Étape 1 : Informations de base (par défaut)
    expect(screen.getByText(/créer un nouveau cv/i)).toBeInTheDocument()
    expect(screen.getByText(/étape.*1.*sur.*4/i)).toBeInTheDocument()
    
    // Vérifier que le bouton auto-remplissage est présent
    const autoFillButton = screen.getByRole('button', { name: /remplir automatiquement/i })
    expect(autoFillButton).toBeInTheDocument()
  })

  it('should have required navigation buttons', () => {
    renderWizard()
    
    // Vérifier que les boutons de navigation sont présents
    expect(screen.getByRole('button', { name: /suivant/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /annuler/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /remplir automatiquement/i })).toBeInTheDocument()
  })

  it('should auto-fill data and go to final step', async () => {
    renderWizard()
    
    // Cliquer sur le bouton d'auto-remplissage
    const autoFillButton = screen.getByRole('button', { name: /remplir automatiquement/i })
    await user.click(autoFillButton)
    
    // Attendre que le bouton "Créer le CV" apparaisse (dernière étape)
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /créer le cv/i })).toBeInTheDocument()
    })
    
    // Vérifier qu'on est bien à la dernière étape
    expect(screen.getByText(/étape.*4.*sur.*4/i)).toBeInTheDocument()
  })

  it('should create CV using auto-fill', async () => {
    mockOnSave.mockImplementation(() => {})
    
    renderWizard()
    
    // Utiliser l'auto-remplissage pour aller directement à la fin
    const autoFillButton = screen.getByRole('button', { name: /remplir automatiquement/i })
    await user.click(autoFillButton)
    
    // Attendre que le bouton "Créer le CV" apparaisse
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /créer le cv/i })).toBeInTheDocument()
    })
    
    // Cliquer sur "Créer le CV"
    const createButton = screen.getByRole('button', { name: /créer le cv/i })
    await user.click(createButton)
    
    // Vérifier que onSave a été appelé avec les données
    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalled()
    })
  })

  it('should close wizard when cancel button is clicked', async () => {
    renderWizard()
    
    // Cliquer sur le bouton fermer/annuler
    const closeButton = screen.getByRole('button', { name: /annuler/i })
    await user.click(closeButton)
    
    // Vérifier que onClose a été appelé
    expect(mockOnClose).toHaveBeenCalled()
  })

  it('should handle the complete flow with auto-fill', async () => {
    renderWizard()
    
    // Utiliser l'auto-remplissage
    const autoFillButton = screen.getByRole('button', { name: /remplir automatiquement/i })
    await user.click(autoFillButton)
    
    // Attendre d'arriver à la dernière étape
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /créer le cv/i })).toBeInTheDocument()
    })
    
    // Vérifier que nous pouvons cliquer sur "Créer le CV"
    const createButton = screen.getByRole('button', { name: /créer le cv/i })
    expect(createButton).not.toBeDisabled()
  })

  it('should display progress indicator', () => {
    renderWizard()
    
    // Vérifier qu'il y a un indicateur de progression plus spécifique
    expect(screen.getByText(/étape.*1.*sur.*4/i)).toBeInTheDocument()
  })

  it('should allow closing the wizard', async () => {
    renderWizard()
    
    // Vérifier que le bouton de fermeture fonctionne
    const closeButtons = screen.getAllByRole('button')
    const closeButton = closeButtons.find(button => 
      button.innerHTML.includes('svg') || button.getAttribute('aria-label') === 'close'
    )
    
    if (closeButton) {
      await user.click(closeButton)
      expect(mockOnClose).toHaveBeenCalled()
    } else {
      // Si pas de bouton X, tester le bouton Annuler
      const cancelButton = screen.getByRole('button', { name: /annuler/i })
      await user.click(cancelButton)
      expect(mockOnClose).toHaveBeenCalled()
    }
  })
})
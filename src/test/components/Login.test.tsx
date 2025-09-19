import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import Login from '../../components/auth/Login'

// Mock de react-hot-toast
vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
    loading: vi.fn(),
    dismiss: vi.fn()
  }
}))

// Mock de useNavigate
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    Link: ({ children, to, ...props }: any) => (
      <a href={to} {...props}>{children}</a>
    )
  }
})

// Mock du contexte Auth
const mockLogin = vi.fn()
const mockClearError = vi.fn()

vi.mock('../../contexts/AuthContext', () => ({
  useAuth: () => ({
    login: mockLogin,
    error: null,
    clearError: mockClearError
  })
}))

describe('Login Component', () => {
  const user = userEvent.setup()

  // Helper pour rendre le composant avec les mocks nécessaires
  const renderLogin = () => {
    return render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    )
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render login form correctly', () => {
    renderLogin()
    
    // Vérifier les éléments du formulaire
    expect(screen.getByPlaceholderText(/votre.email@exemple.com/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/votre mot de passe/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /se connecter/i })).toBeInTheDocument()
    expect(screen.getByText(/pas encore de compte/i)).toBeInTheDocument()
  })

  it('should validate required fields', async () => {
    renderLogin()
    
    const submitButton = screen.getByRole('button', { name: /se connecter/i })
    
    // Le bouton doit être désactivé si les champs sont vides
    expect(submitButton).toBeDisabled()
    
    // Remplir seulement l'email
    const emailInput = screen.getByPlaceholderText(/votre.email@exemple.com/i)
    await user.type(emailInput, 'test@example.com')
    
    // Le bouton doit toujours être désactivé
    expect(submitButton).toBeDisabled()
    
    // Remplir le mot de passe
    const passwordInput = screen.getByPlaceholderText(/votre mot de passe/i)
    await user.type(passwordInput, 'password123')
    
    // Maintenant le bouton doit être activé
    expect(submitButton).not.toBeDisabled()
  })

  it('should toggle password visibility', async () => {
    renderLogin()
    
    const passwordInput = screen.getByPlaceholderText(/votre mot de passe/i)
    // Le bouton eye est dans le même container que l'input password
    const toggleButton = passwordInput.parentElement?.querySelector('button') || 
                         screen.getByRole('button', { hidden: true })
    
    // Par défaut le mot de passe est masqué
    expect(passwordInput).toHaveAttribute('type', 'password')
    
    // Cliquer pour afficher
    await user.click(toggleButton)
    expect(passwordInput).toHaveAttribute('type', 'text')
    
    // Cliquer pour masquer
    await user.click(toggleButton)
    expect(passwordInput).toHaveAttribute('type', 'password')
  })

  it('should call login function on form submission', async () => {
    renderLogin()
    
    const emailInput = screen.getByPlaceholderText(/votre.email@exemple.com/i)
    const passwordInput = screen.getByPlaceholderText(/votre mot de passe/i)
    const submitButton = screen.getByRole('button', { name: /se connecter/i })
    
    // Remplir le formulaire
    await user.type(emailInput, 'test@example.com')
    await user.type(passwordInput, 'password123')
    
    // Soumettre le formulaire
    await user.click(submitButton)
    
    // Vérifier que la fonction login a été appelée avec les bonnes données
    expect(mockLogin).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123'
    })
  })

  it('should navigate to home page on successful login', async () => {
    // Mock login success
    mockLogin.mockResolvedValueOnce(undefined)
    
    renderLogin()
    
    const emailInput = screen.getByPlaceholderText(/votre.email@exemple.com/i)
    const passwordInput = screen.getByPlaceholderText(/votre mot de passe/i)
    const submitButton = screen.getByRole('button', { name: /se connecter/i })
    
    // Remplir et soumettre le formulaire
    await user.type(emailInput, 'test@example.com')
    await user.type(passwordInput, 'password123')
    await user.click(submitButton)
    
    // Attendre la navigation
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/')
    })
  })

  it('should show loading state during login', async () => {
    // Mock login avec délai
    let resolveLogin: (value: unknown) => void
    const loginPromise = new Promise(resolve => {
      resolveLogin = resolve
    })
    mockLogin.mockReturnValueOnce(loginPromise)
    
    renderLogin()
    
    const emailInput = screen.getByPlaceholderText(/votre.email@exemple.com/i)
    const passwordInput = screen.getByPlaceholderText(/votre mot de passe/i)
    const submitButton = screen.getByRole('button', { name: /se connecter/i })
    
    // Remplir et soumettre le formulaire
    await user.type(emailInput, 'test@example.com')
    await user.type(passwordInput, 'password123')
    await user.click(submitButton)
    
    // Vérifier l'état de chargement
    expect(screen.getByText(/connexion.../i)).toBeInTheDocument()
    expect(submitButton).toBeDisabled()
    
    // Résoudre le login
    resolveLogin!(undefined)
    
    await waitFor(() => {
      expect(screen.getByText(/se connecter/i)).toBeInTheDocument()
    })
  })

  it('should update field values when user types', async () => {
    renderLogin()
    
    const emailInput = screen.getByPlaceholderText(/votre.email@exemple.com/i)
    const passwordInput = screen.getByPlaceholderText(/votre mot de passe/i)
    
    // Taper dans les champs
    await user.type(emailInput, 'test@example.com')
    await user.type(passwordInput, 'password123')
    
    // Vérifier que les valeurs sont mises à jour
    expect(emailInput).toHaveValue('test@example.com')
    expect(passwordInput).toHaveValue('password123')
  })

  it('should prevent form submission with empty fields', () => {
    renderLogin()
    
    const submitButton = screen.getByRole('button', { name: /se connecter/i })
    
    // Le bouton doit être désactivé avec des champs vides
    expect(submitButton).toBeDisabled()
    
    // La fonction login ne doit pas être appelée
    expect(mockLogin).not.toHaveBeenCalled()
  })

  it('should handle login errors gracefully', async () => {
    // Mock login failure
    const errorMessage = 'Invalid credentials'
    mockLogin.mockRejectedValueOnce(new Error(errorMessage))
    
    renderLogin()
    
    const emailInput = screen.getByPlaceholderText(/votre.email@exemple.com/i)
    const passwordInput = screen.getByPlaceholderText(/votre mot de passe/i)
    const submitButton = screen.getByRole('button', { name: /se connecter/i })
    
    // Remplir et soumettre le formulaire
    await user.type(emailInput, 'test@example.com')
    await user.type(passwordInput, 'wrongpassword')
    await user.click(submitButton)
    
    // Attendre que l'état de chargement se termine
    await waitFor(() => {
      expect(screen.getByText(/se connecter/i)).toBeInTheDocument()
    })
    
    // Vérifier que l'utilisateur n'est pas redirigé
    expect(mockNavigate).not.toHaveBeenCalled()
  })
})
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { AuthToast } from '@/components/auth-toast'
import { toast } from 'sonner'

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useSearchParams: () => ({
    get: vi.fn((key: string) => {
      if (key === 'error') return 'invalid'
      return null
    }),
  }),
}))

// Mock sonner
vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}))

describe('AuthToast Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('shows error toast for invalid credentials', () => {
    render(<AuthToast />)
    expect(toast.error).toHaveBeenCalledWith(
      'Invalid email or password. Please try again.'
    )
  })
})

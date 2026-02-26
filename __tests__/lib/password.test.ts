import { describe, it, expect } from 'vitest'
import bcrypt from 'bcryptjs'

describe('Password Hashing', () => {
  it('should hash a password successfully', async () => {
    const password = 'mySecurePassword123'
    const hash = await bcrypt.hash(password, 10)
    
    expect(hash).toBeDefined()
    expect(hash).not.toBe(password)
    expect(hash.length).toBeGreaterThan(0)
  })

  it('should verify a correct password', async () => {
    const password = 'mySecurePassword123'
    const hash = await bcrypt.hash(password, 10)
    
    const isValid = await bcrypt.compare(password, hash)
    expect(isValid).toBe(true)
  })

  it('should reject an incorrect password', async () => {
    const password = 'mySecurePassword123'
    const wrongPassword = 'wrongPassword'
    const hash = await bcrypt.hash(password, 10)
    
    const isValid = await bcrypt.compare(wrongPassword, hash)
    expect(isValid).toBe(false)
  })

  it('should generate different hashes for the same password', async () => {
    const password = 'mySecurePassword123'
    const hash1 = await bcrypt.hash(password, 10)
    const hash2 = await bcrypt.hash(password, 10)
    
    expect(hash1).not.toBe(hash2)
    
    // Both should still verify correctly
    expect(await bcrypt.compare(password, hash1)).toBe(true)
    expect(await bcrypt.compare(password, hash2)).toBe(true)
  })
})

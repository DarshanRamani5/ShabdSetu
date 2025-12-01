import { describe, it, expect, jest, beforeEach } from '@jest/globals'

// Mock Brevo SDK before importing mailer
const mockSendTransacEmail = jest.fn()
const mockTransactionalEmailsApi = jest.fn(() => ({
  sendTransacEmail: mockSendTransacEmail,
  authentications: {
    apiKey: { apiKey: null }
  }
}))

jest.unstable_mockModule('@getbrevo/brevo', () => ({
  TransactionalEmailsApi: mockTransactionalEmailsApi,
  SendSmtpEmail: jest.fn(() => ({
    subject: null,
    htmlContent: null,
    sender: null,
    to: null
  }))
}))

// Mock dotenv
jest.unstable_mockModule('dotenv', () => ({
  default: {
    config: jest.fn()
  }
}))

// Set required env var before importing
process.env.BREVO_API_KEY = 'test-api-key'
process.env.BREVO_SENDER_EMAIL = 'test@shabdsetu.app'

const { sendOtpEmail, sendPasswordResetEmail } = await import('../../utils/mailer.js')

describe('Mailer Utils', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('sendOtpEmail', () => {
    it('should send email with correct parameters', async () => {
      mockSendTransacEmail.mockResolvedValue({ messageId: 'test-id' })

      const to = 'test@example.com'
      const code = '123456'
      const expiresAt = new Date()

      await sendOtpEmail({ to, code, expiresAt })

      expect(mockSendTransacEmail).toHaveBeenCalledTimes(1)
      const message = mockSendTransacEmail.mock.calls[0][0]
      expect(message.subject).toContain('verification')
      expect(message.htmlContent).toContain(code)
      expect(message.to).toEqual([{ email: to }])
    })

    it('should handle email sending errors', async () => {
      mockSendTransacEmail.mockRejectedValue(new Error('Brevo API Error'))

      await expect(
        sendOtpEmail({ to: 'fail@test.com', code: '123456', expiresAt: new Date() })
      ).rejects.toThrow('Brevo API Error')
    })

    it('should replace verification code in template', async () => {
      mockSendTransacEmail.mockResolvedValue({ messageId: 'test-id' })

      const code = '999888'
      await sendOtpEmail({ to: 'template@test.com', code, expiresAt: new Date() })

      const message = mockSendTransacEmail.mock.calls[0][0]
      expect(message.htmlContent).toContain(code)
    })
  })

  describe('sendPasswordResetEmail', () => {
    it('should send password reset email with correct parameters', async () => {
      mockSendTransacEmail.mockResolvedValue({ messageId: 'reset-id' })

      const to = 'reset@example.com'
      const code = '654321'

      await sendPasswordResetEmail({ to, code })

      expect(mockSendTransacEmail).toHaveBeenCalledTimes(1)
      const message = mockSendTransacEmail.mock.calls[0][0]
      expect(message.subject).toContain('Password reset')
      expect(message.htmlContent).toContain(code)
      expect(message.to).toEqual([{ email: to }])
    })

    it('should handle password reset email sending errors', async () => {
      mockSendTransacEmail.mockRejectedValue(new Error('Brevo API Error'))

      await expect(
        sendPasswordResetEmail({ to: 'fail@test.com', code: '111222' })
      ).rejects.toThrow('Brevo API Error')
    })
  })

  describe('recipient normalization', () => {
    it('should handle array of email strings', async () => {
      mockSendTransacEmail.mockResolvedValue({ messageId: 'test-id' })

      const recipients = ['user1@test.com', 'user2@test.com']
      await sendOtpEmail({ to: recipients, code: '123456', expiresAt: new Date() })

      const message = mockSendTransacEmail.mock.calls[0][0]
      expect(message.to).toEqual([
        { email: 'user1@test.com' },
        { email: 'user2@test.com' }
      ])
    })

    it('should handle recipient objects with name', async () => {
      mockSendTransacEmail.mockResolvedValue({ messageId: 'test-id' })

      const recipient = { email: 'named@test.com', name: 'Test User' }
      await sendOtpEmail({ to: recipient, code: '123456', expiresAt: new Date() })

      const message = mockSendTransacEmail.mock.calls[0][0]
      expect(message.to).toEqual([{ email: 'named@test.com', name: 'Test User' }])
    })

    it('should handle array of recipient objects', async () => {
      mockSendTransacEmail.mockResolvedValue({ messageId: 'test-id' })

      const recipients = [
        { email: 'user1@test.com', name: 'User One' },
        { email: 'user2@test.com', name: 'User Two' }
      ]
      await sendOtpEmail({ to: recipients, code: '123456', expiresAt: new Date() })

      const message = mockSendTransacEmail.mock.calls[0][0]
      expect(message.to).toEqual([
        { email: 'user1@test.com', name: 'User One' },
        { email: 'user2@test.com', name: 'User Two' }
      ])
    })
  })

  describe('error handling', () => {
    it('should handle Brevo API error with response body', async () => {
      const apiError = new Error('API Error')
      apiError.response = { body: { message: 'Invalid API key' } }
      mockSendTransacEmail.mockRejectedValue(apiError)

      await expect(
        sendOtpEmail({ to: 'test@test.com', code: '123456', expiresAt: new Date() })
      ).rejects.toThrow('API Error')
    })
  })
})

describe('Mailer without BREVO_API_KEY', () => {
  it('should throw error when BREVO_API_KEY is missing', async () => {
    // Clear the API key
    const originalKey = process.env.BREVO_API_KEY
    delete process.env.BREVO_API_KEY

    // Re-import mailer without API key
    jest.resetModules()
    
    jest.unstable_mockModule('@getbrevo/brevo', () => ({
      TransactionalEmailsApi: mockTransactionalEmailsApi,
      SendSmtpEmail: jest.fn(() => ({
        subject: null,
        htmlContent: null,
        sender: null,
        to: null
      }))
    }))

    jest.unstable_mockModule('dotenv', () => ({
      default: {
        config: jest.fn()
      }
    }))

    const { sendOtpEmail: sendOtpNoKey } = await import('../../utils/mailer.js?' + Date.now())

    await expect(
      sendOtpNoKey({ to: 'test@test.com', code: '123456', expiresAt: new Date() })
    ).rejects.toThrow('Email service not configured')

    // Restore
    process.env.BREVO_API_KEY = originalKey
  })
})

describe('Mailer with BREVO_API_BASE_URL', () => {
  it('should set custom base URL when BREVO_API_BASE_URL is provided', async () => {
    process.env.BREVO_API_BASE_URL = 'https://custom-api.brevo.com'
    process.env.BREVO_API_KEY = 'test-key'

    jest.resetModules()

    const mockApiInstance = {
      sendTransacEmail: jest.fn().mockResolvedValue({ messageId: 'test' }),
      authentications: {
        apiKey: { apiKey: null }
      },
      basePath: null
    }

    jest.unstable_mockModule('@getbrevo/brevo', () => ({
      TransactionalEmailsApi: jest.fn(() => mockApiInstance),
      SendSmtpEmail: jest.fn(() => ({
        subject: null,
        htmlContent: null,
        sender: null,
        to: null
      }))
    }))

    jest.unstable_mockModule('dotenv', () => ({
      default: {
        config: jest.fn()
      }
    }))

    const { sendOtpEmail: sendOtpCustomUrl } = await import('../../utils/mailer.js?' + Date.now())
    await sendOtpCustomUrl({ to: 'test@test.com', code: '123456', expiresAt: new Date() })
    expect(mockApiInstance.basePath).toBe('https://custom-api.brevo.com')
    delete process.env.BREVO_API_BASE_URL
  })
})

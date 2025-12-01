import dotenv from 'dotenv'
dotenv.config()
import { TransactionalEmailsApi, SendSmtpEmail } from '@getbrevo/brevo'
import { Password_Reset_Email_Template, Verification_Email_Template } from './EmailTemplate.js'

const fromAddress = process.env.BREVO_SENDER_EMAIL || 'no-reply@shabdsetu.app'
const senderName = process.env.BREVO_SENDER_NAME || 'ShabdSetu'

let brevoClient = null
if (process.env.BREVO_API_KEY) {
  brevoClient = new TransactionalEmailsApi()
  brevoClient.authentications.apiKey.apiKey = process.env.BREVO_API_KEY
  
  if (process.env.BREVO_API_BASE_URL) {
    brevoClient.basePath = process.env.BREVO_API_BASE_URL
  }
}

const normalizeRecipients = (recipient) => {
  if (!recipient) {
    throw new Error('No recipient specified for email delivery')
  }

  const entries = Array.isArray(recipient) ? recipient : [recipient]

  return entries.map((entry) => {
    if (typeof entry === 'string') {
      return { email: entry }
    }

    if (entry && typeof entry === 'object' && entry.email) {
      return { email: entry.email, name: entry.name }
    }

    throw new Error('Invalid recipient format supplied to mailer')
  })
}

const deliverEmail = async ({ to, subject, html }) => {
  if (!brevoClient) {
    console.error('Email service not configured: BREVO_API_KEY missing')
    throw new Error('Email service not configured')
  }

  const message = new SendSmtpEmail()
  message.subject = subject
  message.htmlContent = html
  message.sender = { email: fromAddress, name: senderName }
  message.to = normalizeRecipients(to)

  try {
    const result = await brevoClient.sendTransacEmail(message)
    return result
  } catch (error) {
    console.error('Brevo API error:', error.response?.body || error.message)
    throw error
  }
}

export const sendOtpEmail = async ({ to, code, expiresAt }) => {
  const html = Verification_Email_Template.replace('{verificationCode}', code)

  return deliverEmail({
    to,
    subject: 'ShabdSetu - Email verification code',
    html,
  })
}

export const sendPasswordResetEmail = async ({ to, code }) => {
  const html = Password_Reset_Email_Template.replace('{verificationCode}', code)

  return deliverEmail({
    to,
    subject: 'ShabdSetu - Password reset code',
    html,
  })
}
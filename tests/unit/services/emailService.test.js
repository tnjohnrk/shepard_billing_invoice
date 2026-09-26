import { describe, it, expect } from 'vitest';
import { translateSmtpError } from '../../../src/main/services/emailService.js';

describe('translateSmtpError Unit Tests', () => {
  it('translates EAUTH / bad credentials into human-readable app password instructions', () => {
    const err = { code: 'EAUTH', message: '535-5.7.8 Username and Password not accepted' };
    const res = translateSmtpError(err);
    expect(res).toContain('Wrong Google App Password');
    expect(res).toContain('16-character App Password');
  });

  it('translates EENVELOPE / recipient errors into clear email address check messages', () => {
    const err = { code: 'EENVELOPE', message: '550 5.1.1 The email account that you tried to reach does not exist' };
    const res = translateSmtpError(err);
    expect(res).toContain('Invalid email address');
    expect(res).toContain('Receiver Email');
  });

  it('translates ETIMEDOUT / network connection failure messages cleanly', () => {
    const err = { code: 'ETIMEDOUT', message: 'connect ETIMEDOUT 142.250.185.108:587' };
    const res = translateSmtpError(err);
    expect(res).toContain('Connection timeout or no internet');
    expect(res).toContain('Gmail SMTP server');
  });

  it('translates quota limit errors', () => {
    const err = { response: '550 5.7.1 Daily user sending quota exceeded' };
    const res = translateSmtpError(err);
    expect(res).toContain('Daily Gmail sending quota reached');
  });
});

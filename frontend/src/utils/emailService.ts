// src/utils/emailService.ts
export const sendRegistrationEmail = async (email: string, username: string): Promise<void> => {
  try {
    const response = await fetch('/api/send-registration-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: email,
        subject: 'Registration Successful - Welcome to Our Platform!',
        username: username,
      }),
    });

    if (!response.ok) {
      console.warn('Failed to send registration email, but registration was successful');
    }
  } catch (error) {
    console.warn('Email service unavailable, but registration was successful', error);
  }
};
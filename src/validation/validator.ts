export function isValidEmail(email: string): boolean {
  if (!email) {
    return false;
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function isValidPassword(password: string): boolean {
  if (!password || password.length < 8) {
    return false;
  }
  const hasUppercase = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>/?]/.test(password);
  return hasUppercase && hasNumber && hasSpecialChar;
}

export function sanitizeInput(input: string): string {
  if (!input) {
    return '';
  }
  return input.trim().replace(/<[^>]*>/g, '');
}

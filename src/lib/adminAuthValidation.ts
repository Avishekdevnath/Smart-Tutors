type ValidationSuccess<T> = {
  data: T;
};

type ValidationError = {
  error: string;
};

type ValidationResult<T> = ValidationSuccess<T> | ValidationError;

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function sanitizeText(input: string): string {
  return input.replace(/[\u0000-\u001F\u007F]/g, '').trim();
}

function isSafeText(input: string): boolean {
  return !/[<>]/.test(input);
}

function asObject(payload: unknown): ValidationResult<Record<string, unknown>> {
  if (!isPlainObject(payload)) {
    return { error: 'Invalid request body' };
  }

  return { data: payload };
}

export function validateAdminLoginPayload(payload: unknown): ValidationResult<{ username: string; password: string }> {
  const bodyResult = asObject(payload);
  if ('error' in bodyResult) return bodyResult;

  const username = sanitizeText(String(bodyResult.data.username ?? ''));
  const password = String(bodyResult.data.password ?? '').trim();

  if (!username || !password) {
    return { error: 'Username and password are required' };
  }

  if (username.length > 100 || password.length > 256) {
    return { error: 'Invalid credentials format' };
  }

  if (!isSafeText(username)) {
    return { error: 'Invalid username format' };
  }

  return {
    data: {
      username,
      password
    }
  };
}

export function validateChangePasswordPayload(payload: unknown): ValidationResult<{
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}> {
  const bodyResult = asObject(payload);
  if ('error' in bodyResult) return bodyResult;

  const currentPassword = String(bodyResult.data.currentPassword ?? '').trim();
  const newPassword = String(bodyResult.data.newPassword ?? '').trim();
  const confirmPassword = String(bodyResult.data.confirmPassword ?? '').trim();

  if (!currentPassword || !newPassword || !confirmPassword) {
    return { error: 'All fields are required' };
  }

  if (newPassword !== confirmPassword) {
    return { error: 'New passwords do not match' };
  }

  if (newPassword.length < 6) {
    return { error: 'New password must be at least 6 characters long' };
  }

  if (newPassword.length > 256 || currentPassword.length > 256) {
    return { error: 'Password length is invalid' };
  }

  return {
    data: {
      currentPassword,
      newPassword,
      confirmPassword
    }
  };
}

export function validateChangeEmailPayload(payload: unknown): ValidationResult<{
  currentPassword: string;
  newEmail: string;
}> {
  const bodyResult = asObject(payload);
  if ('error' in bodyResult) return bodyResult;

  const currentPassword = String(bodyResult.data.currentPassword ?? '').trim();
  const newEmail = sanitizeText(String(bodyResult.data.newEmail ?? '')).toLowerCase();

  if (!currentPassword || !newEmail) {
    return { error: 'Current password and new email are required' };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(newEmail)) {
    return { error: 'Invalid email format' };
  }

  if (!isSafeText(newEmail)) {
    return { error: 'Invalid email format' };
  }

  return {
    data: {
      currentPassword,
      newEmail
    }
  };
}

export function validateChangeUsernamePayload(payload: unknown): ValidationResult<{
  currentPassword: string;
  newUsername: string;
}> {
  const bodyResult = asObject(payload);
  if ('error' in bodyResult) return bodyResult;

  const currentPassword = String(bodyResult.data.currentPassword ?? '').trim();
  const newUsername = sanitizeText(String(bodyResult.data.newUsername ?? ''));

  if (!currentPassword || !newUsername) {
    return { error: 'Current password and new username are required' };
  }

  if (newUsername.length < 3 || newUsername.length > 30) {
    return { error: 'Username must be between 3 and 30 characters' };
  }

  if (!/^[a-zA-Z0-9_-]+$/.test(newUsername)) {
    return { error: 'Username can only contain letters, numbers, underscores, and hyphens' };
  }

  return {
    data: {
      currentPassword,
      newUsername
    }
  };
}

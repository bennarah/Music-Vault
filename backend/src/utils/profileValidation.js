function validateEmail(email) {
  if (!email) {
    return {
      valid: false,
      message: 'Email is required.',
    };
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailPattern.test(email)) {
    return {
      valid: false,
      message: 'Email must be a valid email address.',
    };
  }

  return {
    valid: true,
    message: null,
  };
}

function validateProfile({ email, spotifyId = null }) {
  const emailResult = validateEmail(email);

  if (!emailResult.valid) {
    return emailResult;
  }

  if (spotifyId !== null && typeof spotifyId !== 'string') {
    return {
      valid: false,
      message: 'spotifyId must be a string or null.',
    };
  }

  return {
    valid: true,
    message: null,
  };
}

module.exports = {
  validateEmail,
  validateProfile,
};
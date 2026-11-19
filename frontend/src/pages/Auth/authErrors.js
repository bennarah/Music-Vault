export function getAuthErrorMessage(error) {
  const message = error?.message || "";

  if (
    message.includes("API request failed: 404") ||
    message.includes("API request failed: 501")
  ) {
    return "Account sign-in and registration are not available yet. Please try again when authentication is enabled.";
  }

  if (
    message.includes("Failed to fetch") ||
    message.includes("NetworkError")
  ) {
    return "Unable to connect to MusicVault. Please check your connection and try again.";
  }

  if (message.includes("API request failed: 401")) {
    return "The email or password was not accepted.";
  }

  return "We couldn't complete your request. Please try again.";
}

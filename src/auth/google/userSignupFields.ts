import { defineUserSignupFields } from "wasp/server/auth";

export const googleUserSignupFields = defineUserSignupFields({
  username: (data: any) => {
    // For Google OAuth, data contains profile information directly
    // Available fields: name, given_name, family_name, email, etc.

    if (data.name) {
      // Create username from display name, removing spaces and making lowercase
      let baseUsername = data.name
        .toLowerCase()
        .replace(/\s+/g, '')
        .replace(/[^a-z0-9]/g, '');

      // Ensure minimum length
      if (baseUsername.length < 6) {
        baseUsername = baseUsername + Math.random().toString(36).substring(2, 8);
      }

      return baseUsername.substring(0, 20); // Limit length
    }

    if (data.email) {
      // Fallback to email-based username
      const emailUsername = data.email.split('@')[0].toLowerCase();
      return emailUsername + Math.random().toString(36).substring(2, 4);
    }

    // Final fallback - random username
    return 'user' + Math.random().toString(36).substring(2, 12);
  },
});
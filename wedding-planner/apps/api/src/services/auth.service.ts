export const authService = {
  // Mock function to extract user ID from a token
  // In a real implementation, this would decode the JWT
  getUserIdFromToken: (token: string) => {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.userId;
    } catch (e) {
      return null;
    }
  },

  // Mock function to get current user role
  getUserRole: (token: string) => {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.role;
    } catch (e) {
      return null;
    }
  }
};

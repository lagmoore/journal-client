// src/renderer/utils/tokenUtils.js

/**
 * Decodes a JWT token
 * 
 * @param {string} token - JWT token to decode
 * @returns {object} Decoded token payload
 */
export const decodeToken = (token) => {
    try {
      // Parse the JWT without using libraries
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
  
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  };
  
  /**
   * Checks if a token is expired
   * 
   * @param {string} token - JWT token to check
   * @returns {boolean} True if token is expired, false otherwise
   */
  export const isTokenExpired = (token) => {
    try {
      const decodedToken = decodeToken(token);
      
      if (!decodedToken || !decodedToken.exp) {
        return true;
      }
      
      // Convert expiration time to milliseconds
      const expirationTime = decodedToken.exp * 1000; 
      const currentTime = Date.now();
      
      return currentTime >= expirationTime;
    } catch (error) {
      console.error('Error checking token expiry:', error);
      return true;
    }
  };
  
  /**
   * Gets the time (in milliseconds) until a token expires
   * 
   * @param {string} token - JWT token to check
   * @returns {number} Time in milliseconds until expiry, or 0 if token is expired or invalid
   */
  export const getTimeUntilExpiry = (token) => {
    try {
      const decodedToken = decodeToken(token);
      
      if (!decodedToken || !decodedToken.exp) {
        return 0;
      }
      
      // Convert expiration time to milliseconds
      const expirationTime = decodedToken.exp * 1000; 
      const currentTime = Date.now();
      
      // If token is already expired, return 0
      if (currentTime >= expirationTime) {
        return 0;
      }
      
      return expirationTime - currentTime;
    } catch (error) {
      console.error('Error getting time until token expiry:', error);
      return 0;
    }
  };
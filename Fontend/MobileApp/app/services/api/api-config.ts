// Use this import if you want to use "env.js" file
// const { API_URL } = require("../../config/env")
// Or just specify it directly like this:
// const API_URL = "http://example.com"

/**
 * The options used to configure the API.
 */

// tnmtest
export const API_URL = "http://103.138.113.52"
export const PORT = "5001"
export const Origin = "http://tnmtest.tringhiatech.vn:8080"

// tnm production
// export const API_URL = "http://103.109.36.4"
// export const PORT = "5002"
// export const Origin = "http://erp.tringhiatech.vn"

export interface ApiConfig {
  /**
   * The URL of the api.
   */
  url: string

  /**
   * Milliseconds before we timeout the request.
   */
  timeout: number
}

/**
 * The default configuration for the app.
 */
export const DEFAULT_API_CONFIG: ApiConfig = {
  url: `${API_URL}:${PORT}/api`,
  timeout: 30000,
}

/**
 * Offline test environment: a fixed dummy API key (never a real one, no .env is loaded).
 * Import this module before anything that sends requests.
 */
export const TEST_API_KEY = "offline-test-key";

process.env.PLACETEL_API_KEY = TEST_API_KEY;

/**
 * Test environment: a fixed placeholder key, never a real one, and no .env loading.
 * Import this before any module from dist/.
 */
export const TEST_API_KEY = "offline-test-key";
process.env.PLACETEL_API_KEY = TEST_API_KEY;

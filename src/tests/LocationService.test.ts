import { describe, it, expect, vi, beforeEach } from 'vitest';
import { LocationService } from '../services/locationService';

describe('LocationService', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    // Reset global navigator
    if (global.navigator) {
      Object.defineProperty(global.navigator, 'geolocation', {
        value: undefined,
        writable: true,
        configurable: true,
      });
    }
  });

  it('getCurrentLocation should return default coordinates if geolocation is not supported', async () => {
    const coords = await LocationService.getCurrentLocation();
    expect(coords.latitude).toBe(28.5458);
    expect(coords.longitude).toBe(77.1932);
    expect(coords.campusZone).toBe('Student Health & Clinic Block (H)');
  });

  it('getCurrentLocation should return correct coordinates on success', async () => {
    const mockGeolocation = {
      getCurrentPosition: vi.fn().mockImplementation((success) => {
        success({
          coords: {
            latitude: 28.1234,
            longitude: 77.5678,
            accuracy: 10,
          },
          timestamp: 123456789,
        });
      }),
    };

    Object.defineProperty(global.navigator, 'geolocation', {
      value: mockGeolocation,
      writable: true,
      configurable: true,
    });

    const coords = await LocationService.getCurrentLocation();
    expect(coords.latitude).toBe(28.1234);
    expect(coords.longitude).toBe(77.5678);
    expect(coords.accuracy).toBe(10);
  });

  it('getCurrentLocation should handle permission denied error scenario', async () => {
    const mockGeolocation = {
      getCurrentPosition: vi.fn().mockImplementation((success, error) => {
        error({
          code: 1, // PERMISSION_DENIED
          PERMISSION_DENIED: 1,
          POSITION_UNAVAILABLE: 2,
          TIMEOUT: 3,
          message: 'User denied geolocation',
        });
      }),
    };

    Object.defineProperty(global.navigator, 'geolocation', {
      value: mockGeolocation,
      writable: true,
      configurable: true,
    });

    await expect(LocationService.getCurrentLocation()).rejects.toThrow(
      'Location access was denied'
    );
  });

  it('formatCoordinates should correctly format lat/lng output strings', () => {
    const formatted = LocationService.formatCoordinates({
      latitude: 28.545812,
      longitude: 77.193234,
    });
    expect(formatted).toBe('28.54581° N, 77.19323° E');
  });

  it('getGoogleMapsUrl should build the correct dynamic url', () => {
    const url = LocationService.getGoogleMapsUrl({
      latitude: 12.34,
      longitude: 56.78,
    });
    expect(url).toBe('https://www.google.com/maps/search/?api=1&query=12.34,56.78');
  });
});

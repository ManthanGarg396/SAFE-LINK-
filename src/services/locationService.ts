export interface GeoCoordinates {
  latitude: number;
  longitude: number;
  accuracy?: number;
  campusZone?: string;
  timestamp?: number;
}

export const CAMPUS_ZONES = [
  { name: 'Student Health & Clinic Block (H)', lat: 28.545, lng: 77.192 },
  { name: 'Central Science & Chemistry Block (C)', lat: 28.547, lng: 77.195 },
  { name: 'Engineering Workshop & Labs (Block E)', lat: 28.549, lng: 77.198 },
  { name: 'Central Library & Reading Hall', lat: 28.546, lng: 77.193 },
  { name: 'Student Hostels Quadrangle (Hostel A/B)', lat: 28.544, lng: 77.191 },
  { name: 'Main Campus Gate 1 & Security HQ', lat: 28.542, lng: 77.190 },
  { name: 'Sports Complex & Multipurpose Arena', lat: 28.551, lng: 77.197 },
];

export const LocationService = {
  getCurrentLocation(): Promise<GeoCoordinates> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        // Return default mock campus coordinates if browser doesn't support
        resolve({
          latitude: 28.5458,
          longitude: 77.1932,
          accuracy: 15,
          campusZone: 'Student Health & Clinic Block (H)',
          timestamp: Date.now(),
        });
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          const campusZone = this.matchCampusZone(lat, lng);
          resolve({
            latitude: lat,
            longitude: lng,
            accuracy: Math.round(position.coords.accuracy),
            campusZone,
            timestamp: position.timestamp,
          });
        },
        (error) => {
          let message = 'An unknown error occurred';
          switch (error.code) {
            case error.PERMISSION_DENIED:
              message = 'Location access was denied. Please enable location permissions in your browser settings to use this feature.';
              break;
            case error.POSITION_UNAVAILABLE:
              message = 'Location information is unavailable.';
              break;
            case error.TIMEOUT:
              message = 'The request to get user location timed out.';
              break;
          }
          reject(new Error(message));
        },
        { enableHighAccuracy: true, timeout: 8000, maximumAge: 30000 }
      );
    });
  },

  matchCampusZone(lat: number, lng: number): string {
    // For demo/campus match
    return 'Main Campus — Academic Block Near Central Hall';
  },

  formatCoordinates(coords: GeoCoordinates): string {
    return `${coords.latitude.toFixed(5)}° N, ${coords.longitude.toFixed(5)}° E`;
  },

  getGoogleMapsUrl(coords: GeoCoordinates): string {
    return `https://www.google.com/maps/search/?api=1&query=${coords.latitude},${coords.longitude}`;
  },
};

const KAABA = { lat: 21.422487, lng: 39.826206 };

/** Great-circle bearing from (lat,lng) to the Kaaba, degrees clockwise from true north. */
export function qiblaBearing(lat: number, lng: number): number {
  const toRad = (x: number) => (x * Math.PI) / 180;
  const phi1 = toRad(lat);
  const phi2 = toRad(KAABA.lat);
  const dLng = toRad(KAABA.lng - lng);
  const y = Math.sin(dLng);
  const x = Math.cos(phi1) * Math.tan(phi2) - Math.sin(phi1) * Math.cos(dLng);
  return ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;
}

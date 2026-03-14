export interface GovernorateSeed {
  governorate: string;
  city: string;
  center: { lat: number; lng: number };
  spanKm: number;
}

export const IRAQ_GOVERNORATE_SEEDS: GovernorateSeed[] = [
  { governorate: "Baghdad", city: "Baghdad", center: { lat: 33.3152, lng: 44.3661 }, spanKm: 24 },
  { governorate: "Basra", city: "Basra", center: { lat: 30.5085, lng: 47.7804 }, spanKm: 20 },
  { governorate: "Nineveh", city: "Mosul", center: { lat: 36.34, lng: 43.13 }, spanKm: 24 },
  { governorate: "Erbil", city: "Erbil", center: { lat: 36.1911, lng: 44.0092 }, spanKm: 18 },
  { governorate: "Sulaymaniyah", city: "Sulaymaniyah", center: { lat: 35.5613, lng: 45.4305 }, spanKm: 16 },
  { governorate: "Duhok", city: "Duhok", center: { lat: 36.8617, lng: 42.9996 }, spanKm: 14 },
  { governorate: "Kirkuk", city: "Kirkuk", center: { lat: 35.4681, lng: 44.3922 }, spanKm: 16 },
  { governorate: "Anbar", city: "Ramadi", center: { lat: 33.4206, lng: 43.3078 }, spanKm: 18 },
  { governorate: "Najaf", city: "Najaf", center: { lat: 31.9956, lng: 44.314 }, spanKm: 12 },
  { governorate: "Karbala", city: "Karbala", center: { lat: 32.6149, lng: 44.0249 }, spanKm: 12 },
  { governorate: "Diyala", city: "Baqubah", center: { lat: 33.754, lng: 44.6052 }, spanKm: 14 },
  { governorate: "Wasit", city: "Kut", center: { lat: 32.5128, lng: 45.8182 }, spanKm: 12 },
  { governorate: "Maysan", city: "Amarah", center: { lat: 31.8356, lng: 47.1442 }, spanKm: 12 },
  { governorate: "Dhi Qar", city: "Nasiriyah", center: { lat: 31.0459, lng: 46.2573 }, spanKm: 14 },
  { governorate: "Qadisiyyah", city: "Diwaniyah", center: { lat: 31.9929, lng: 44.9255 }, spanKm: 12 },
  { governorate: "Babil", city: "Hillah", center: { lat: 32.4811, lng: 44.4356 }, spanKm: 12 },
  { governorate: "Saladin", city: "Tikrit", center: { lat: 34.6071, lng: 43.6782 }, spanKm: 14 },
  { governorate: "Muthanna", city: "Samawah", center: { lat: 31.3319, lng: 45.2806 }, spanKm: 12 },
];

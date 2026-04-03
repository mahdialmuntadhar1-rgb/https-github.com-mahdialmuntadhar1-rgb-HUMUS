import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { useHomeStore } from "@/stores/homeStore";

const GOVERNORATES = [
  { name: "Baghdad", nameAr: "بغداد", nameKu: "Bexdayê" },
  { name: "Erbil", nameAr: "أربيل", nameKu: "Hewlêr" },
  { name: "Dohuk", nameAr: "دهوك", nameKu: "Duhok" },
  { name: "Sulaymaniyah", nameAr: "السليمانية", nameKu: "Silêmanî" },
  { name: "Basra", nameAr: "البصرة", nameKu: "Besre" },
  { name: "Mosul", nameAr: "الموصل", nameKu: "Mûsil" },
  { name: "Tikrit", nameAr: "تكريت", nameKu: "Tekrît" },
  { name: "Najaf", nameAr: "النجف", nameKu: "Necef" },
  { name: "Karbala", nameAr: "كربلاء", nameKu: "Kerbela" },
  { name: "Hilla", nameAr: "الحلة", nameKu: "Hille" },
];

const CITIES_BY_GOVERNORATE: Record<string, string[]> = {
  Baghdad: ["Central", "Kadhimiya", "Adhamiyah", "Sadr City", "Rusafa"],
  Erbil: ["Erbil Center", "Ankawa", "Ainkawa", "Pirmam"],
  Dohuk: ["Dohuk Center", "Zakho", "Amedi"],
  Sulaymaniyah: ["Sulaymaniyah Center", "Chamchamal", "Halabja"],
  Basra: ["Basra City", "Um Qasr", "Fao"],
  Mosul: ["Mosul Center", "West Mosul", "East Mosul"],
  Tikrit: ["Tikrit Center", "Samarra"],
  Najaf: ["Najaf Center", "Kufa"],
  Karbala: ["Karbala Center", "Abu Ghurab"],
  Hilla: ["Hilla Center", "Kifl"],
};

export default function LocationFilter() {
  const { selectedGovernorate, selectedCity, setGovernorate, setCity } = useHomeStore();
  const [governorateOpen, setGovernorateOpen] = useState(false);
  const [cityOpen, setCityOpen] = useState(false);

  const governorateObj = GOVERNORATES.find((g) => g.name === selectedGovernorate);
  const cities = CITIES_BY_GOVERNORATE[selectedGovernorate] || [];

  return (
    <div className="sticky top-16 z-40 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 py-4">
        {/* Label */}
        <p className="text-sm font-bold text-humus-dark mb-3 poppins-semibold">
          Select Your Location
        </p>

        <div className="flex flex-col sm:flex-row gap-3">
          {/* Governorate Dropdown */}
          <div className="relative flex-1">
            <button
              onClick={() => {
                setGovernorateOpen(!governorateOpen);
                setCityOpen(false);
              }}
              className="w-full px-4 py-3 bg-humus-off-white border-2 border-humus-blue rounded-lg flex items-center justify-between hover:bg-gray-100 transition-all duration-200"
            >
              <span className="font-bold text-humus-dark">
                {governorateObj?.name || "Select Governorate"}
              </span>
              <ChevronDown
                size={20}
                className={`text-humus-blue transition-transform duration-200 ${
                  governorateOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {/* Governorate Dropdown Menu */}
            {governorateOpen && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white border-2 border-humus-blue rounded-lg shadow-xl z-50 max-h-60 overflow-y-auto animate-fade-in">
                {GOVERNORATES.map((gov) => (
                  <button
                    key={gov.name}
                    onClick={() => {
                      setGovernorate(gov.name);
                      setCity(CITIES_BY_GOVERNORATE[gov.name]?.[0] || "");
                      setGovernorateOpen(false);
                    }}
                    className={`w-full px-4 py-3 text-left hover:bg-humus-coral/10 transition-colors duration-150 border-b border-gray-100 last:border-b-0 ${
                      selectedGovernorate === gov.name
                        ? "bg-humus-coral/20 font-bold text-humus-blue"
                        : "text-humus-dark"
                    }`}
                  >
                    <span className="block font-bold">{gov.name}</span>
                    <span className="text-xs text-humus-gray-500">{gov.nameAr} • {gov.nameKu}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* City Dropdown */}
          <div className="relative flex-1">
            <button
              onClick={() => {
                setCityOpen(!cityOpen);
                setGovernorateOpen(false);
              }}
              className="w-full px-4 py-3 bg-humus-off-white border-2 border-humus-cyan rounded-lg flex items-center justify-between hover:bg-gray-100 transition-all duration-200"
            >
              <span className="font-bold text-humus-dark">
                {selectedCity || "Select City"}
              </span>
              <ChevronDown
                size={20}
                className={`text-humus-cyan transition-transform duration-200 ${
                  cityOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {/* City Dropdown Menu */}
            {cityOpen && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white border-2 border-humus-cyan rounded-lg shadow-xl z-50 max-h-60 overflow-y-auto animate-fade-in">
                {cities.length > 0 ? (
                  cities.map((city) => (
                    <button
                      key={city}
                      onClick={() => {
                        setCity(city);
                        setCityOpen(false);
                      }}
                      className={`w-full px-4 py-3 text-left hover:bg-humus-cyan/10 transition-colors duration-150 border-b border-gray-100 last:border-b-0 font-bold ${
                        selectedCity === city
                          ? "bg-humus-cyan/20 text-humus-blue"
                          : "text-humus-dark"
                      }`}
                    >
                      {city}
                    </button>
                  ))
                ) : (
                  <div className="px-4 py-3 text-humus-gray-500 text-center">
                    No cities available
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Search Button */}
          <button className="btn-primary px-8">
            Search
          </button>
        </div>

        {/* Info Text */}
        {selectedGovernorate && selectedCity && (
          <p className="text-sm text-humus-gray-600 mt-3">
            Showing results in <span className="font-bold text-humus-blue">{selectedCity}, {selectedGovernorate}</span>
          </p>
        )}
      </div>
    </div>
  );
}

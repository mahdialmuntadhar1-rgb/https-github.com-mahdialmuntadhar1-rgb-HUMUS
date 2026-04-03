import { useHomeStore } from "@/stores/homeStore";

const GOVERNORATES = [
  { name: "Baghdad", nameAr: "بغداد" },
  { name: "Erbil", nameAr: "أربيل" },
  { name: "Basra", nameAr: "البصرة" },
  { name: "Mosul", nameAr: "الموصل" },
  { name: "Sulaymaniyah", nameAr: "السليمانية" },
  { name: "Duhok", nameAr: "دهوك" },
  { name: "Kirkuk", nameAr: "كركوك" },
  { name: "Najaf", nameAr: "النجف" },
  { name: "Karbala", nameAr: "كربلاء" },
  { name: "Nasiriyah", nameAr: "الناصرية" },
  { name: "Amarah", nameAr: "العمارة" },
  { name: "Hilla", nameAr: "الحلة" },
  { name: "Kut", nameAr: "الكوت" },
  { name: "Diwaniyah", nameAr: "الديوانية" },
  { name: "Ramadi", nameAr: "الرمادي" },
  { name: "Baqubah", nameAr: "بعقوبة" },
  { name: "Samawah", nameAr: "السماوة" },
  { name: "Tikrit", nameAr: "تكريت" },
];

export default function LocationFilter() {
  const { selectedGovernorate, setGovernorate } = useHomeStore();

  return (
    <div className="bg-transparent mb-12">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-3 sm:flex sm:flex-wrap gap-2 sm:gap-3">
          {GOVERNORATES.map((gov) => {
            const isActive = selectedGovernorate === gov.name;
            return (
              <button
                key={gov.name}
                onClick={() => setGovernorate(gov.name)}
                className={`px-2 sm:px-6 py-2 sm:py-2.5 rounded-xl sm:rounded-full text-[10px] sm:text-sm font-bold transition-all duration-300 shadow-sm border-2 flex flex-col sm:flex-row items-center justify-center gap-0.5 sm:gap-2 ${
                  isActive
                    ? "bg-[#8B1A1A] text-white border-[#8B1A1A] shadow-md scale-105 z-10"
                    : "bg-white text-[#2B2F33] border-[#f5dada] hover:border-[#8B1A1A]/30 hover:bg-[#FDECEC]/50"
                }`}
              >
                <span className="whitespace-nowrap">{gov.name}</span>
                <span className={`text-[8px] sm:text-[10px] opacity-60 ${isActive ? "text-white/80" : "text-gray-400"}`}>
                  {gov.nameAr}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

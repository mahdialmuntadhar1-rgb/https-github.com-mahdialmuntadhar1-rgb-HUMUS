export interface Business {
  id: string;
  name: string;
  nameAr?: string | null;
  nameKu?: string | null;
  category: string;
  governorate: string;
  city: string;
  address?: string | null;
  phone?: string | null;
  rating?: number | null;
  reviewCount?: number | null;
  isFeatured?: boolean | null;
  isVerified?: boolean | null;
  image?: string | null;
  website?: string | null;
  socialLinks?: {
    facebook?: string | null;
    instagram?: string | null;
    twitter?: string | null;
    whatsapp?: string | null;
  };
  description?: string | null;
  descriptionAr?: string | null;
  openingHours?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

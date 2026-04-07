export interface Business {
  id: string;
  name: string;
  nameAr?: string;
  nameKu?: string;
  category: string;
  governorate: string;
  city: string;
  neighborhood?: string;
  address: string;
  phone: string;
  rating?: number;
  reviewCount?: number;
  isFeatured?: boolean;
  isVerified?: boolean;
  image?: string;
  website?: string;
  socialLinks?: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    whatsapp?: string;
  };
  description?: string;
  descriptionAr?: string;
  openingHours?: string;
  ownerId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PostComment {
  id: string;
  postId: string;
  authorName: string;
  commentText: string;
  createdAt: Date;
  isSeeded?: boolean;
}

export interface Post {
  id: string;
  businessId: string;
  content: string;
  image?: string;
  likes: number;
  comments: number;
  shares: number;
  createdAt: Date;
  authorName?: string;
  authorAvatar?: string;
  businessName?: string;
  businessCity?: string;
  businessCategory?: string;
  businessPhone?: string;
  businessWhatsapp?: string;
  postComments?: PostComment[];
}

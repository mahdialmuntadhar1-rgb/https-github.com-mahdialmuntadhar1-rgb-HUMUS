import Image from 'next/image';
import { Business } from '@/lib/supabaseClient';

interface BusinessCardProps {
  business: Business;
}

export default function BusinessCard({ business }: BusinessCardProps) {
  // Get business name with fallbacks
  const getBusinessName = () => {
    if (business.name) return business.name;
    if (business.nameAr) return business.nameAr;
    if (business.nameKu) return business.nameKu;
    return 'Unnamed Business';
  };

  // Get description with fallbacks
  const getDescription = () => {
    if (business.description) return business.description;
    if (business.descriptionAr) return business.descriptionAr;
    if (business.descriptionKu) return business.descriptionKu;
    return '';
  };

  // Get image with fallback
  const imageUrl = business.imageUrl || business.coverImage || '/placeholder-business.jpg';

  // Format rating
  const formatRating = () => {
    if (!business.rating) return null;
    return (
      <div className="flex items-center gap-1">
        <span className="text-yellow-500">★</span>
        <span className="text-sm font-semibold">{business.rating.toFixed(1)}</span>
        {business.reviewCount && (
          <span className="text-xs text-gray-500">({business.reviewCount})</span>
        )}
      </div>
    );
  };

  // Get contact info
  const getContactInfo = () => {
    const contacts = [];
    if (business.phone) contacts.push(business.phone);
    if (business.whatsapp) contacts.push(`WhatsApp: ${business.whatsapp}`);
    if (business.website) contacts.push(business.website);
    return contacts;
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow h-full flex flex-col">
      {/* Image */}
      <div className="relative w-full h-48 bg-gray-200">
        <Image
          src={imageUrl}
          alt={getBusinessName()}
          fill
          className="object-cover"
          onError={(e) => {
            // Fallback for failed images
            const img = e.target as HTMLImageElement;
            img.src = '/placeholder-business.jpg';
          }}
        />

        {/* Premium Badge */}
        {business.isPremium && (
          <div className="absolute top-2 right-2 bg-yellow-500 text-white px-2 py-1 rounded text-xs font-bold">
            Premium
          </div>
        )}

        {/* Verified Badge */}
        {business.isVerified && (
          <div className="absolute top-2 left-2 bg-green-500 text-white px-2 py-1 rounded text-xs font-bold">
            ✓ Verified
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-grow">
        {/* Name and Rating */}
        <div className="mb-2">
          <h3 className="font-bold text-lg line-clamp-2">{getBusinessName()}</h3>
          <div className="flex justify-between items-start mt-1">
            <span className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded">
              {business.category || 'Uncategorized'}
            </span>
            {formatRating()}
          </div>
        </div>

        {/* Location */}
        <div className="text-sm text-gray-600 mb-2">
          {business.city && <p>{business.city}</p>}
          {business.address && <p className="line-clamp-1">{business.address}</p>}
        </div>

        {/* Description */}
        {getDescription() && (
          <p className="text-sm text-gray-700 line-clamp-2 mb-3 flex-grow">
            {getDescription()}
          </p>
        )}

        {/* Contact Info */}
        {getContactInfo().length > 0 && (
          <div className="border-t pt-3">
            <p className="text-xs text-gray-500 mb-2 font-semibold">Contact:</p>
            <div className="space-y-1">
              {getContactInfo().map((contact, idx) => (
                <p key={idx} className="text-xs text-blue-600 truncate hover:text-blue-800">
                  {contact}
                </p>
              ))}
            </div>
          </div>
        )}

        {/* Price Range */}
        {business.priceRange && (
          <div className="text-xs text-gray-600 mt-2 pt-2 border-t">
            Price: {business.priceRange}
          </div>
        )}
      </div>
    </div>
  );
}

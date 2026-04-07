import { Heart, MessageCircle, Share2, MoreHorizontal } from 'lucide-react';

interface SocialPost {
  id: string;
  businessName: string;
  businessLogo?: string;
  image: string;
  caption: string;
  likes: number;
  comments: number;
  timestamp: string;
}

const mockPosts: SocialPost[] = [
  {
    id: '1',
    businessName: 'Baghdad Cafe',
    businessLogo: 'BC',
    image: 'https://picsum.photos/seed/cafe1/400/400',
    caption: 'Fresh Arabic coffee brewed daily! Come experience the authentic taste of Baghdad. #Coffee #Baghdad #Traditional',
    likes: 234,
    comments: 18,
    timestamp: '2 hours ago'
  },
  {
    id: '2',
    businessName: 'Erbil Electronics',
    businessLogo: 'EE',
    image: 'https://picsum.photos/seed/electronics1/400/400',
    caption: 'New smartphones just arrived! Latest models at unbeatable prices. Visit us in Erbil for the best deals. #Electronics #Smartphones #Erbil',
    likes: 156,
    comments: 23,
    timestamp: '4 hours ago'
  },
  {
    id: '3',
    businessName: 'Basra Restaurant',
    businessLogo: 'BR',
    image: 'https://picsum.photos/seed/restaurant1/400/400',
    caption: 'Fresh seafood from the Persian Gulf! Our special grilled fish is a must-try. Made with love and traditional spices. #Seafood #Basra #Fresh',
    likes: 412,
    comments: 45,
    timestamp: '6 hours ago'
  },
  {
    id: '4',
    businessName: 'Mosul Fashion',
    businessLogo: 'MF',
    image: 'https://picsum.photos/seed/fashion1/400/400',
    caption: 'New collection is here! Modern designs with traditional Iraqi touches. Quality fabrics at affordable prices. #Fashion #Mosul #Style',
    likes: 189,
    comments: 31,
    timestamp: '8 hours ago'
  },
  {
    id: '5',
    businessName: 'Sulaymaniyah Gym',
    businessLogo: 'SG',
    image: 'https://picsum.photos/seed/gym1/400/400',
    caption: 'Transform your body and mind! State-of-the-art equipment with expert trainers. Join our community today. #Fitness #Gym #Sulaymaniyah',
    likes: 298,
    comments: 27,
    timestamp: '12 hours ago'
  },
  {
    id: '6',
    businessName: 'Najaf Bookstore',
    businessLogo: 'NB',
    image: 'https://picsum.photos/seed/books1/400/400',
    caption: 'Knowledge is power! Huge collection of Arabic and English books. Special discount on academic books this month. #Books #Najaf #Education',
    likes: 167,
    comments: 19,
    timestamp: '1 day ago'
  },
  // Additional Arabic posts
  {
    id: '7',
    businessName: 'مطعم بغدادية',
    businessLogo: 'مب',
    image: 'https://picsum.photos/seed/baghdadiya/400/400',
    caption: 'أفضل المأكولات العراقية الأصيلة! كباب بغدادي على الفحم مع الأرز العباسي. احجز طاولتك الآن 🇮🇶 #بغداد #أكل_عراقي #كباب',
    likes: 567,
    comments: 42,
    timestamp: '30 mins ago'
  },
  {
    id: '8',
    businessName: 'Karbala Sweets',
    businessLogo: 'KS',
    image: 'https://picsum.photos/seed/sweets1/400/400',
    caption: 'Traditional Iraqi sweets fresh from our kitchen! Klecha, Baklava, and our famous date cookies. Perfect for Eid celebrations 🍯 #Karbala #Sweets #Traditional',
    likes: 423,
    comments: 38,
    timestamp: '1 hour ago'
  },
  {
    id: '9',
    businessName: 'مكتبة الرافدين',
    businessLogo: 'ر',
    image: 'https://picsum.photos/seed/rafeedeen/400/400',
    caption: '📚 عروض خاصة على الكتب الجامعية! خصم ٢٥٪ على جميع الكتب القانونية والطبية. زورونا في فرع المنصور #بغداد #كتب #جامعة',
    likes: 234,
    comments: 15,
    timestamp: '3 hours ago'
  },
  {
    id: '10',
    businessName: 'Duhok Market',
    businessLogo: 'DM',
    image: 'https://picsum.photos/seed/duhokmarket/400/400',
    caption: 'Fresh fruits and vegetables daily! Direct from local farms to your table. Supporting Kurdish farmers 🌾 #Duhok #Fresh #Organic #Local',
    likes: 312,
    comments: 28,
    timestamp: '5 hours ago'
  },
  {
    id: '11',
    businessName: 'صيدلية النور',
    businessLogo: 'ن',
    image: 'https://picsum.photos/seed/pharmacy1/400/400',
    caption: 'خدمة ٢٤ ساعة 💊 توصيل مجاني للأدوية لجميع مناطق كربلاء. استشارة صيدلاني مجانية عبر الواتساب #صيدلية #كربلاء #صحة',
    likes: 891,
    comments: 56,
    timestamp: '7 hours ago'
  },
  {
    id: '12',
    businessName: 'Anbar Coffee',
    businessLogo: 'AC',
    image: 'https://picsum.photos/seed/anbarcoffee/400/400',
    caption: 'Good morning Ramadi! ☕ Start your day with our special Arabic coffee blend. Quiet workspace and fast WiFi available. #Ramadi #Coffee #WorkSpace',
    likes: 178,
    comments: 22,
    timestamp: '9 hours ago'
  },
  {
    id: '13',
    businessName: 'محل النجف للعطور',
    businessLogo: 'ع',
    image: 'https://picsum.photos/seed/perfume1/400/400',
    caption: '✨ عطور شرقية أصلية - دهن العود، المسك، والعنبر. أفضل الهدايا للمناسبات. توصيل لجميع المحافظات #عطور #النجف #هدايا',
    likes: 445,
    comments: 33,
    timestamp: '10 hours ago'
  },
  {
    id: '14',
    businessName: 'Kirkuk Electronics',
    businessLogo: 'KE',
    image: 'https://picsum.photos/seed/kirkuktech/400/400',
    caption: 'New gaming laptops in stock! RTX 4060, 4070, 4090 available now. Installment plans up to 12 months 🎮 #Kirkuk #Gaming #Laptops',
    likes: 289,
    comments: 41,
    timestamp: '14 hours ago'
  },
  {
    id: '15',
    businessName: 'مقهى الموصل',
    businessLogo: 'مو',
    image: 'https://picsum.photos/seed/mosulcafe/400/400',
    caption: 'جلسات خارجية رائعة مع إطلالة على النهر ☕🌊 أفضل مكان للقاء الأصدقاء في الموصل القديمة. موسيقى حية كل جمعة #الموصل #مقهى #ترفيه',
    likes: 678,
    comments: 47,
    timestamp: '16 hours ago'
  }
];

export default function SocialFeed() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <div className="space-y-6">
        {mockPosts.map((post) => (
          <div key={post.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            {/* Post Header */}
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-black text-sm">
                  {post.businessLogo}
                </div>
                <div>
                  <h3 className="font-black text-sm text-slate-900">{post.businessName}</h3>
                  <p className="text-xs text-slate-500">{post.timestamp}</p>
                </div>
              </div>
              <button className="p-2 hover:bg-slate-50 rounded-full transition-colors">
                <MoreHorizontal className="w-4 h-4 text-slate-400" />
              </button>
            </div>

            {/* Post Image */}
            <div className="aspect-square bg-slate-100">
              <img 
                src={post.image} 
                alt={post.businessName}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>

            {/* Post Actions */}
            <div className="p-4">
              <div className="flex items-center gap-4 mb-3">
                <button className="flex items-center gap-2 hover:text-red-500 transition-colors">
                  <Heart className="w-5 h-5" />
                  <span className="text-sm font-medium">{post.likes}</span>
                </button>
                <button className="flex items-center gap-2 hover:text-blue-500 transition-colors">
                  <MessageCircle className="w-5 h-5" />
                  <span className="text-sm font-medium">{post.comments}</span>
                </button>
                <button className="hover:text-green-500 transition-colors">
                  <Share2 className="w-5 h-5" />
                </button>
              </div>

              {/* Post Caption */}
              <div className="text-sm text-slate-900 leading-relaxed">
                <span className="font-black">{post.businessName}</span>
                <p className="mt-1">{post.caption}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Load More */}
      <div className="mt-8 text-center">
        <button className="px-6 py-3 bg-white border border-slate-100 rounded-full text-sm font-black text-slate-600 hover:border-slate-200 hover:text-slate-900 transition-all">
          Load More Posts
        </button>
      </div>
    </div>
  );
}

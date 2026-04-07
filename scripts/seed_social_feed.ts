import { supabase } from '../src/lib/supabaseClient';

// Arabic content templates for different business categories
const ARABIC_TEMPLATES = {
  Restaurant: {
    captions: [
      'Enjoy our authentic Iraqi cuisine! Fresh ingredients and traditional recipes passed down through generations. # IraqiFood # Restaurant # Baghdad',
      'Special Iraqi dishes cooked with love and care. Come taste the flavors of our heritage! #TraditionalFood #IraqiCuisine',
      'Fresh mandi and kebabs prepared daily. Bring your family for an unforgettable dining experience! #FamilyDining #Iraq',
      'Taste the real flavors of Iraq in every bite. Our chefs use only the finest local ingredients. #Authentic #IraqiRestaurant'
    ],
    comments: [
      'Excellent food! Highly recommended.',
      'Amazing authentic taste, will visit again.',
      'Best Iraqi restaurant in the city!',
      'Great service and delicious food.',
      'Love the traditional atmosphere here.'
    ]
  },
  Cafe: {
    captions: [
      'Perfect coffee brewed with love in the heart of Iraq. Your daily escape starts here. #Coffee #Cafe #Erbil',
      'Cozy atmosphere and exceptional coffee. The perfect place to work or relax with friends. #IraqiCafe #CoffeeLovers',
      'Fresh pastries and premium coffee beans sourced locally. Your morning ritual awaits! #LocalCoffee #Pastries',
      'Traditional Iraqi tea and modern coffee blends. Experience the best of both worlds! #TeaTime #ModernCafe'
    ],
    comments: [
      'Best coffee in town!',
      'Love the atmosphere here.',
      'Perfect place to work and relax.',
      'Great service and amazing coffee.',
      'Cozy and welcoming environment.'
    ]
  },
  Shopping: {
    captions: [
      'New arrivals just in! Quality products at unbeatable prices. Discover the best of Iraqi shopping. #Shopping #Deals #Basra',
      'Traditional Iraqi crafts and modern goods. Support local businesses while finding unique treasures. #LocalShopping #Crafts',
      'Premium quality products with Iraqi heritage. Modern shopping with traditional values. #Quality #IraqiProducts',
      'Exclusive collections available now. Find everything you need under one roof. #ShoppingCenter #Iraq'
    ],
    comments: [
      'Great products and reasonable prices.',
      'Love supporting local businesses.',
      'Excellent quality and service.',
      'Found exactly what I was looking for.',
      'Best shopping experience in Iraq.'
    ]
  },
  Hotel: {
    captions: [
      'Comfortable rooms and exceptional Iraqi hospitality. Your home away from home. #Hotel #Hospitality #Sulaymaniyah',
      'Luxury accommodation with traditional Iraqi warmth. Experience comfort like never before. #LuxuryHotel #Iraq',
      'Modern amenities with traditional hospitality. Your perfect stay in Iraq awaits. #HotelStay #Comfort',
      'Experience Iraqi culture through our hospitality. We make every guest feel like family. #Welcome #IraqiHotel'
    ],
    comments: [
      'Excellent hospitality and service.',
      'Beautiful hotel with great staff.',
      'Felt like home away from home.',
      'Best hotel experience in Iraq.',
      'Clean, comfortable, and welcoming.'
    ]
  },
  default: {
    captions: [
      'Quality service you can trust. Visit us today and experience the best of Iraq! #Business #Services #Iraq',
      'Professional service with Iraqi values. We put our customers first. #Professional #CustomerService',
      'Excellence in every service we provide. Your satisfaction is our priority. #Excellence #IraqBusiness',
      'Traditional values, modern service. Experience the best of both worlds. #ModernServices #IraqiValues'
    ],
    comments: [
      'Professional and reliable service.',
      'Excellent customer service.',
      'Highly recommended business.',
      'Great experience overall.',
      'Trustworthy and professional.'
    ]
  }
};

// Arabic names for comment authors
const ARABIC_NAMES = [
  'Ahmed', 'Fatima', 'Ali', 'Zainab', 'Omar', 'Layla', 'Mohammed', 'Aisha', 
  'Hassan', 'Khadija', 'Hussein', 'Mariam', 'Abdullah', 'Safiya', 'Yusuf', 'Zahra'
];

// Realistic engagement numbers
function generateEngagement() {
  return {
    likes: Math.floor(Math.random() * 150) + 5,      // 5-155 likes
    comments: Math.floor(Math.random() * 25) + 1,     // 1-26 comments  
    shares: Math.floor(Math.random() * 40) + 1        // 1-41 shares
  };
}

// Get random item from array
function getRandom<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

// Get random Arabic name
function getRandomArabicName() {
  return getRandom(ARABIC_NAMES);
}

// Get template for category
function getTemplateForCategory(category: string) {
  const key = Object.keys(ARABIC_TEMPLATES).find(k => 
    category.toLowerCase().includes(k.toLowerCase())
  ) || 'default';
  return ARABIC_TEMPLATES[key as keyof typeof ARABIC_TEMPLATES];
}

// Main seeding function
export async function seedSocialFeed() {
  console.log('Starting social feed seeding...');
  
  try {
    // Get approved businesses
    const { data: businesses, error: businessError } = await supabase
      .from('businesses')
      .select('id, business_name, category, city, governorate, status')
      .eq('status', 'approved')
      .limit(50);

    if (businessError) {
      console.error('Error fetching businesses:', businessError);
      return;
    }

    if (!businesses || businesses.length === 0) {
      console.log('No approved businesses found');
      return;
    }

    console.log(`Found ${businesses.length} approved businesses`);

    // Select a diverse set of businesses across categories and cities
    const selectedBusinesses = businesses
      .sort(() => Math.random() - 0.5) // Shuffle
      .slice(0, Math.min(20, businesses.length)); // Take up to 20

    console.log(`Selected ${selectedBusinesses.length} businesses for seeding`);

    // Clear existing seeded posts
    const { error: deleteError } = await supabase
      .from('posts')
      .delete()
      .eq('is_seeded', true);

    if (deleteError) {
      console.warn('Warning: Could not clear existing seeded posts:', deleteError);
    }

    // Insert new posts
    const postsToInsert = [];
    
    for (const business of selectedBusinesses) {
      const template = getTemplateForCategory(business.category || '');
      const numPosts = Math.floor(Math.random() * 3) + 1; // 1-3 posts per business
      
      for (let i = 0; i < numPosts; i++) {
        const engagement = generateEngagement();
        const caption = getRandom(template.captions);
        
        postsToInsert.push({
          business_id: business.id,
          caption,
          image_url: `https://picsum.photos/seed/${business.id}-${i}/400/400`,
          is_seeded: true,
          status: 'active',
          likes_count: engagement.likes,
          comments_count: engagement.comments,
          shares_count: engagement.shares
        });
      }
    }

    // Insert posts
    const { data: insertedPosts, error: insertError } = await supabase
      .from('posts')
      .insert(postsToInsert)
      .select('id, business_id');

    if (insertError) {
      console.error('Error inserting posts:', insertError);
      return;
    }

    console.log(`Inserted ${insertedPosts?.length || 0} posts`);

    // Insert comments for the posts
    const commentsToInsert = [];
    
    for (const post of insertedPosts || []) {
      const template = getTemplateForCategory(
        selectedBusinesses.find(b => b.id === post.business_id)?.category || ''
      );
      const numComments = Math.floor(Math.random() * 4) + 1; // 1-4 comments per post
      
      for (let i = 0; i < numComments; i++) {
        commentsToInsert.push({
          post_id: post.id,
          author_name: getRandomArabicName(),
          comment_text: getRandom(template.comments),
          is_seeded: true
        });
      }
    }

    // Insert comments
    const { data: insertedComments, error: commentError } = await supabase
      .from('post_comments')
      .insert(commentsToInsert)
      .select('id');

    if (commentError) {
      console.error('Error inserting comments:', commentError);
    } else {
      console.log(`Inserted ${insertedComments?.length || 0} comments`);
    }

    // Summary
    console.log('\n=== Seeding Summary ===');
    console.log(`Businesses selected: ${selectedBusinesses.length}`);
    console.log(`Categories covered: ${[...new Set(selectedBusinesses.map(b => b.category))].join(', ')}`);
    console.log(`Cities covered: ${[...new Set(selectedBusinesses.map(b => b.city))].join(', ')}`);
    console.log(`Posts created: ${insertedPosts?.length || 0}`);
    console.log(`Comments created: ${insertedComments?.length || 0}`);
    console.log('Social feed seeding completed successfully!');

  } catch (error) {
    console.error('Unexpected error during seeding:', error);
  }
}

// Run seeding if called directly
if (require.main === module) {
  seedSocialFeed();
}

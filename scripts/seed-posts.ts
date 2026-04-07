/**
 * Seed Social Posts Data
 * 
 * This script creates sample social media posts for existing businesses.
 * Run this after creating the posts table to populate it with realistic data.
 */

import { supabaseAdmin } from '../lib/supabaseAdmin';

interface Business {
  id: string;
  business_name: string;
  category: string | null;
  governorate: string | null;
}

const POST_TEMPLATES = {
  Restaurant: [
    "Fresh ingredients and authentic flavors! Come taste our special dishes today. #Food #Restaurant #{governorate}",
    "Chef's special is ready! Limited portions available. Book your table now. #FineDining #Cuisine",
    "Weekend family feast special! Bring your loved ones for unforgettable memories. #FamilyDining #WeekendVibes",
    "New recipe alert! We've been perfecting this dish for months. Come be the first to try it! #NewMenu #Innovation",
    "Happy Hour all day today! Buy one get one free on selected items. #Special #Deals"
  ],
  Cafe: [
    "Perfect coffee brewed with love. Your daily escape starts here. #Coffee #Cafe #{governorate}",
    "New pastries just out of the oven! Pair them with our signature coffee. #Bakery #Fresh",
    "Cozy corner with your favorite book and our best coffee. What more could you ask for? #Reading #CoffeeTime",
    "Study session fuel! 20% off for students with valid ID. #StudentDeals #StudyCafe",
    "Artisan coffee from around the world. Try our new single-origin collection! #SpecialtyCoffee #Artisan"
  ],
  Hotel: [
    "Comfortable rooms and exceptional service. Your home away from home. #Hotel #Hospitality #{governorate}",
    "Weekend getaway package! Includes breakfast and spa access. Book now for special rates. #WeekendDeal #Relaxation",
    "Business traveler special! High-speed WiFi, workspace, and early check-in. #BusinessTravel #Convenience",
    "Romantic dinner package for couples. Candlelit dinner with wine pairing. #Romance #DateNight",
    "Family vacation ready! Kids stay free and activities included. #FamilyFun #Vacation"
  ],
  Shopping: [
    "New arrivals just in! Quality products at unbeatable prices. #Shopping #Deals #{governorate}",
    "Flash sale today only! Up to 50% off on selected items. Don't miss out! #Sale #ShoppingDeals",
    "Latest collection now available. Be the first to own the trendiest items. #Fashion #Style",
    "Customer appreciation week! Exclusive discounts for our loyal customers. #ThankYou #SpecialOffer",
    "Gift wrapping available! Perfect for that special someone. #Gifts #Shopping"
  ],
  Hospital: [
    "Your health is our priority. Advanced medical care with compassion. #Healthcare #Medical #{governorate}",
    "New health screening packages available. Prevention is better than cure. #HealthCheck #Prevention",
    "Expert doctors, caring staff. Your health is in safe hands. #Doctors #Health",
    "Emergency services available 24/7. We're here when you need us most. #Emergency #Healthcare",
    "Pediatric care with a gentle touch. Your little ones deserve the best. #ChildHealth #Pediatrics"
  ],
  Clinic: [
    "Professional healthcare services in a comfortable environment. #Clinic #Health #{governorate}",
    "Appointment slots available this week. Book your consultation today. #Health #Wellness",
    "Specialized care for your specific needs. Expert medical advice. #MedicalCare #Clinic",
    "Preventive care is the best care. Regular checkups keep you healthy. #Prevention #Health",
    "Modern facilities, experienced staff. Your health journey starts here. #Healthcare #Clinic"
  ],
  Pharmacy: [
    "Your health, our mission. Prescription and over-the-counter medications available. #Pharmacy #Health #{governorate}",
    "Health consultation available. Our pharmacists are here to help. #HealthAdvice #Pharmacy",
    "Stock up on essentials! We have everything you need for your health. #HealthEssentials #Pharmacy",
    "Free delivery on orders above certain amount. Your health delivered to your door. #Delivery #Convenience",
    "Vitamins and supplements in stock. Boost your immunity today! #Wellness #Health"
  ],
  Supermarket: [
    "Fresh produce, great prices! Quality groceries for your family. #Groceries #Fresh #{governorate}",
    "Weekly specials on your favorite items. Save big on your grocery bill. #Deals #Savings",
    "Organic section now available! Healthy options for conscious consumers. #Organic #Healthy",
    "Home delivery service available. Get groceries delivered to your doorstep. #Convenience #Delivery",
    "International foods section now open! Taste the world without leaving town. #International #Food"
  ],
  Gym: [
    "Transform your body and mind! State-of-the-art equipment with expert trainers. #Fitness #Gym #{governorate}",
    "New group fitness classes! Yoga, Zumba, and more. Join the fun! #GroupFitness #Classes",
    "Personal training packages available. Achieve your goals faster with expert guidance. #PersonalTraining #Fitness",
    "Student discounts available! Stay fit while saving money. #StudentDeals #Fitness",
    "24/7 access now available! Work out on your schedule. #Fitness #Anytime"
  ],
  Salon: [
    "Look and feel your best! Professional beauty services in a relaxing environment. #Beauty #Salon #{governorate}",
    "New hairstyle trends! Our stylists are up-to-date with the latest looks. #HairStyle #Beauty",
    "Wedding packages available! Bridal hair and makeup for your special day. #Wedding #Beauty",
    "Gentlemen's grooming services. Look sharp and confident. #MensGrooming #Barber",
    "Pamper yourself with our spa services. Relax and rejuvenate. #Spa #Wellness"
  ],
  Education: [
    "Quality education for bright futures. Enroll now for upcoming term. #Education #Learning #{governorate}",
    "New courses announced! Expand your skills and knowledge. #Courses #Skills",
    "Experienced teachers, modern facilities. Give your child the best start. #School #Education",
    "Adult education programs available. It's never too late to learn! #AdultLearning #Education",
    "Scholarship opportunities for deserving students. Invest in your future. #Scholarship #Education"
  ],
  default: [
    "Quality service you can trust. Visit us today and experience the difference! #Business #Services #{governorate}",
    "Customer satisfaction is our priority. Come see why we're the best in town! #Excellence #Service",
    "New and improved! We've upgraded our services for your convenience. #Innovation #Business",
    "Thank you to our loyal customers! Your support means everything to us. #Gratitude #Community",
    "Open and ready to serve you! Visit us during business hours. #OpenForBusiness #Services"
  ]
};

function getRandomPost(category: string | null, governorate: string | null): string {
  const templates = POST_TEMPLATES[category as keyof typeof POST_TEMPLATES] || POST_TEMPLATES.default;
  const template = templates[Math.floor(Math.random() * templates.length)];
  return template.replace('{governorate}', governorate || 'Iraq');
}

function getRandomLikes(): number {
  // Random likes between 5 and 500
  return Math.floor(Math.random() * 495) + 5;
}

function getRandomComments(): number {
  // Random comments between 0 and 50
  return Math.floor(Math.random() * 51);
}

async function seedPosts() {
  try {
    console.log('[seed] Starting to seed posts...');

    // Get existing businesses
    const { data: businesses, error: businessError } = await supabaseAdmin
      .from('businesses')
      .select('id, business_name, category, governorate')
      .eq('status', 'approved')
      .limit(50);

    if (businessError) {
      console.error('[seed] Error fetching businesses:', businessError);
      throw businessError;
    }

    if (!businesses || businesses.length === 0) {
      console.log('[seed] No approved businesses found. Please create some businesses first.');
      return;
    }

    console.log(`[seed] Found ${businesses.length} approved businesses`);

    // Create posts for each business
    const posts = [];
    for (const business of businesses) {
      // Create 1-3 posts per business
      const postCount = Math.floor(Math.random() * 3) + 1;
      
      for (let i = 0; i < postCount; i++) {
        posts.push({
          business_id: business.id,
          caption: getRandomPost(business.category, business.governorate),
          image_url: `https://picsum.photos/seed/${business.id}-${i}/400/400`,
          likes_count: getRandomLikes(),
          comments_count: getRandomComments(),
          is_active: true
        });
      }
    }

    console.log(`[seed] Creating ${posts.length} posts...`);

    // Insert posts in batches of 10
    const batchSize = 10;
    for (let i = 0; i < posts.length; i += batchSize) {
      const batch = posts.slice(i, i + batchSize);
      
      const { error: insertError } = await supabaseAdmin
        .from('posts')
        .insert(batch);

      if (insertError) {
        console.error(`[seed] Error inserting batch ${i / batchSize + 1}:`, insertError);
        throw insertError;
      }

      console.log(`[seed] Inserted batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(posts.length / batchSize)}`);
    }

    console.log(`[seed] Successfully seeded ${posts.length} posts!`);

    // Verify the data
    const { count, error: countError } = await supabaseAdmin
      .from('posts')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true);

    if (countError) {
      console.error('[seed] Error counting posts:', countError);
    } else {
      console.log(`[seed] Total active posts in database: ${count}`);
    }

    console.log('[seed] Seeding completed successfully!');

  } catch (error) {
    console.error('[seed] Seeding failed:', error);
    throw error;
  }
}

// Run the seeding function
seedPosts().catch(console.error);

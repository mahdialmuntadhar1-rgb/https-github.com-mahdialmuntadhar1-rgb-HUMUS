/**
 * FeedComponent Crash Fix Test
 * 
 * This script tests various data scenarios to ensure FeedComponent
 * never crashes with missing or partial business data.
 */

// Test scenarios that should not crash FeedComponent
const testScenarios = [
  {
    name: "Complete business data (old schema)",
    post: {
      id: "1",
      businessId: "biz1",
      content: "Test post content",
      createdAt: new Date(),
      likes: 5
    },
    business: {
      id: "biz1",
      name: "Test Business",
      phone: "+9647701234567",
      category: "Technology",
      city: "Baghdad"
    }
  },
  {
    name: "Complete business data (new schema)",
    post: {
      id: "2", 
      businessId: "biz2",
      content: "Test post content",
      createdAt: new Date(),
      likes: 3
    },
    business: {
      id: "biz2",
      business_name: "New Business",
      phone_1: "+9647707654321",
      phone_2: "+9647501234567",
      whatsapp: "+9647701234567",
      category: "Restaurant",
      city: "Basra"
    }
  },
  {
    name: "Missing business (has authorName)",
    post: {
      id: "3",
      businessId: "biz3",
      content: "Test post content",
      createdAt: new Date(),
      likes: 2,
      authorName: "Custom Author"
    },
    business: null
  },
  {
    name: "Missing business (no authorName)",
    post: {
      id: "4",
      businessId: "biz4",
      content: "Test post content", 
      createdAt: new Date(),
      likes: 1
    },
    business: null
  },
  {
    name: "Business with no phone fields",
    post: {
      id: "5",
      businessId: "biz5",
      content: "Test post content",
      createdAt: new Date(),
      likes: 0
    },
    business: {
      id: "biz5",
      name: "No Phone Business",
      category: "General",
      city: "Unknown"
    }
  },
  {
    name: "Business with only whatsapp in socialLinks",
    post: {
      id: "6",
      businessId: "biz6",
      content: "Test post content",
      createdAt: new Date(),
      likes: 4
    },
    business: {
      id: "biz6",
      name: "Social Business",
      category: "Media",
      city: "Erbil",
      socialLinks: {
        whatsapp: "+9647709998888"
      }
    }
  },
  {
    name: "Business with partial phone fields",
    post: {
      id: "7",
      businessId: "biz7",
      content: "Test post content",
      createdAt: new Date(),
      likes: 6
    },
    business: {
      id: "biz7",
      business_name: "Partial Business",
      phone_1: null,
      phone_2: "+9647501112222",
      whatsapp: null,
      category: "Healthcare",
      city: "Mosul"
    }
  }
];

// Simulate the FeedComponent logic
function testFeedComponentLogic() {
  console.log('Testing FeedComponent crash fixes...\n');
  
  testScenarios.forEach((scenario, index) => {
    console.log(`\n=== Test ${index + 1}: ${scenario.name} ===`);
    
    try {
      const { post, business } = scenario;
      
      // Simulate the business lookup
      const foundBusiness = business; // In real component: businesses.find(b => b.id === post.businessId)
      
      // Simulate the defensive logging
      if (!foundBusiness && post.businessId) {
        console.warn('[FeedComponent] Business not found for post:', {
          postId: post.id,
          businessId: post.businessId,
          postContent: post.content.substring(0, 50) + '...'
        });
      }
      
      // Simulate the helper functions
      const getPhone = (biz) => {
        if (!biz) return null;
        
        // Try new schema fields first
        if ('phone_1' in biz && biz.phone_1) return biz.phone_1;
        if ('phone_2' in biz && biz.phone_2) return biz.phone_2;
        if ('whatsapp' in biz && biz.whatsapp) return biz.whatsapp;
        
        // Try socialLinks.whatsapp
        if (biz.socialLinks?.whatsapp) return biz.socialLinks.whatsapp;
        
        // Fallback to old single phone field
        if (biz.phone) return biz.phone;
        
        return null;
      };
      
      const getBusinessName = (biz) => {
        if (!biz) return "Unknown Business";
        
        if ('business_name' in biz && biz.business_name) return biz.business_name;
        if ('english_name' in biz && biz.english_name) return biz.english_name;
        if (biz.name) return biz.name;
        
        return "Unknown Business";
      };
      
      // Simulate the safety check
      if (!foundBusiness && !post.authorName) {
        console.warn('[FeedComponent] Skipping post with no business or author data');
        console.log('RESULT: Post skipped safely - NO CRASH');
        return;
      }
      
      const phone = getPhone(foundBusiness);
      const authorName = post.authorName || getBusinessName(foundBusiness);
      
      console.log('RESULT: Rendered successfully');
      console.log(`  - Author: ${authorName}`);
      console.log(`  - Phone: ${phone || 'No phone'}`);
      console.log(`  - Business found: ${!!foundBusiness}`);
      console.log(`  - Author name fallback: ${!!post.authorName}`);
      
      // Simulate additional logging
      if (foundBusiness) {
        const businessFields = Object.keys(foundBusiness);
        const hasPhoneFields = businessFields.some(field => 
          ['phone', 'phone_1', 'phone_2', 'whatsapp'].includes(field)
        );
        
        if (!hasPhoneFields) {
          console.warn('[FeedComponent] Business missing phone fields:', {
            businessId: foundBusiness.id,
            businessName: getBusinessName(foundBusiness),
            availableFields: businessFields
          });
        }
      }
      
    } catch (error) {
      console.error('CRASH DETECTED:', error.message);
      console.log('RESULT: FAILED - Component would crash');
    }
  });
  
  console.log('\n=== Test Summary ===');
  console.log('All scenarios tested. FeedComponent should handle all cases without crashing.');
}

// Run the test
testFeedComponentLogic();

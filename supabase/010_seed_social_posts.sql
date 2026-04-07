-- ============================================
-- SEED: 15 Social Posts (6 original + 9 new Arabic/mixed)
-- These posts will populate the Social feed with realistic content
-- ============================================

-- Only insert if we have approved businesses to link to
DO $$
DECLARE
    biz_baghdad_cafe TEXT;
    biz_erbil_electronics TEXT;
    biz_basra_restaurant TEXT;
    biz_mosul_fashion TEXT;
    biz_sulaymaniyah_gym TEXT;
    biz_najaf_bookstore TEXT;
    biz_karbala_sweets TEXT;
    biz_duhok_market TEXT;
    biz_anbar_coffee TEXT;
    biz_kirkuk_electronics TEXT;
    biz_mosul_cafe TEXT;
    biz_iraqi_restaurant TEXT;
    biz_pharmacy TEXT;
    biz_bookstore TEXT;
    biz_perfume TEXT;
BEGIN
    -- Get some business IDs to link posts to (or use fallback IDs)
    SELECT id INTO biz_baghdad_cafe FROM businesses WHERE status = 'approved' AND (category ILIKE '%cafe%' OR category ILIKE '%dining%' OR business_name ILIKE '%cafe%') LIMIT 1;
    SELECT id INTO biz_erbil_electronics FROM businesses WHERE status = 'approved' AND (category ILIKE '%electronic%' OR category ILIKE '%shopping%') LIMIT 1;
    SELECT id INTO biz_basra_restaurant FROM businesses WHERE status = 'approved' AND (category ILIKE '%restaurant%' OR category ILIKE '%dining%') LIMIT 1;
    SELECT id INTO biz_mosul_fashion FROM businesses WHERE status = 'approved' AND (category ILIKE '%fashion%' OR category ILIKE '%clothing%') LIMIT 1;
    SELECT id INTO biz_sulaymaniyah_gym FROM businesses WHERE status = 'approved' AND (category ILIKE '%gym%' OR category ILIKE '%fitness%') LIMIT 1;
    SELECT id INTO biz_najaf_bookstore FROM businesses WHERE status = 'approved' AND (category ILIKE '%book%' OR category ILIKE '%education%') LIMIT 1;
    
    -- Use any available businesses for the new posts if specific ones not found
    SELECT id INTO biz_karbala_sweets FROM businesses WHERE status = 'approved' LIMIT 1 OFFSET 6;
    SELECT id INTO biz_duhok_market FROM businesses WHERE status = 'approved' LIMIT 1 OFFSET 7;
    SELECT id INTO biz_anbar_coffee FROM businesses WHERE status = 'approved' LIMIT 1 OFFSET 8;
    SELECT id INTO biz_kirkuk_electronics FROM businesses WHERE status = 'approved' LIMIT 1 OFFSET 9;
    SELECT id INTO biz_mosul_cafe FROM businesses WHERE status = 'approved' LIMIT 1 OFFSET 10;
    SELECT id INTO biz_iraqi_restaurant FROM businesses WHERE status = 'approved' LIMIT 1 OFFSET 11;
    SELECT id INTO biz_pharmacy FROM businesses WHERE status = 'approved' LIMIT 1 OFFSET 12;
    SELECT id INTO biz_bookstore FROM businesses WHERE status = 'approved' LIMIT 1 OFFSET 13;
    SELECT id INTO biz_perfume FROM businesses WHERE status = 'approved' LIMIT 1 OFFSET 14;

    -- Insert the 15 posts if businesses exist
    IF biz_baghdad_cafe IS NOT NULL THEN
        INSERT INTO posts (business_id, caption, image_url, likes_count, comments_count, is_active, created_at)
        VALUES 
            -- Original 6 posts
            (biz_baghdad_cafe, 'Fresh Arabic coffee brewed daily! Come experience the authentic taste of Baghdad. #Coffee #Baghdad #Traditional', 'https://picsum.photos/seed/cafe1/400/400', 234, 18, true, NOW() - INTERVAL '2 hours'),
            (biz_erbil_electronics, 'New smartphones just arrived! Latest models at unbeatable prices. Visit us in Erbil for the best deals. #Electronics #Smartphones #Erbil', 'https://picsum.photos/seed/electronics1/400/400', 156, 23, true, NOW() - INTERVAL '4 hours'),
            (biz_basra_restaurant, 'Fresh seafood from the Persian Gulf! Our special grilled fish is a must-try. Made with love and traditional spices. #Seafood #Basra #Fresh', 'https://picsum.photos/seed/restaurant1/400/400', 412, 45, true, NOW() - INTERVAL '6 hours'),
            (biz_mosul_fashion, 'New collection is here! Modern designs with traditional Iraqi touches. Quality fabrics at affordable prices. #Fashion #Mosul #Style', 'https://picsum.photos/seed/fashion1/400/400', 189, 31, true, NOW() - INTERVAL '8 hours'),
            (biz_sulaymaniyah_gym, 'Transform your body and mind! State-of-the-art equipment with expert trainers. Join our community today. #Fitness #Gym #Sulaymaniyah', 'https://picsum.photos/seed/gym1/400/400', 298, 27, true, NOW() - INTERVAL '12 hours'),
            (biz_najaf_bookstore, 'Knowledge is power! Huge collection of Arabic and English books. Special discount on academic books this month. #Books #Najaf #Education', 'https://picsum.photos/seed/books1/400/400', 167, 19, true, NOW() - INTERVAL '1 day')
        ON CONFLICT DO NOTHING;
    END IF;

    -- Insert the 9 new Arabic/mixed posts
    IF biz_iraqi_restaurant IS NOT NULL THEN
        INSERT INTO posts (business_id, caption, image_url, likes_count, comments_count, is_active, created_at)
        VALUES 
            (biz_iraqi_restaurant, 'أفضل المأكولات العراقية الأصيلة! كباب بغدادي على الفحم مع الأرز العباسي. احجز طاولتك الآن 🇮🇶 #بغداد #أكل_عراقي #كباب', 'https://picsum.photos/seed/baghdadiya/400/400', 567, 42, true, NOW() - INTERVAL '30 minutes'),
            (biz_karbala_sweets, 'Traditional Iraqi sweets fresh from our kitchen! Klecha, Baklava, and our famous date cookies. Perfect for Eid celebrations 🍯 #Karbala #Sweets #Traditional', 'https://picsum.photos/seed/sweets1/400/400', 423, 38, true, NOW() - INTERVAL '1 hour'),
            (biz_bookstore, '📚 عروض خاصة على الكتب الجامعية! خصم ٢٥٪ على جميع الكتب القانونية والطبية. زورونا في فرع المنصور #بغداد #كتب #جامعة', 'https://picsum.photos/seed/rafeedeen/400/400', 234, 15, true, NOW() - INTERVAL '3 hours'),
            (biz_duhok_market, 'Fresh fruits and vegetables daily! Direct from local farms to your table. Supporting Kurdish farmers 🌾 #Duhok #Fresh #Organic #Local', 'https://picsum.photos/seed/duhokmarket/400/400', 312, 28, true, NOW() - INTERVAL '5 hours'),
            (biz_pharmacy, 'خدمة ٢٤ ساعة 💊 توصيل مجاني للأدوية لجميع مناطق كربلاء. استشارة صيدلاني مجانية عبر الواتساب #صيدلية #كربلاء #صحة', 'https://picsum.photos/seed/pharmacy1/400/400', 891, 56, true, NOW() - INTERVAL '7 hours'),
            (biz_anbar_coffee, 'Good morning Ramadi! ☕ Start your day with our special Arabic coffee blend. Quiet workspace and fast WiFi available. #Ramadi #Coffee #WorkSpace', 'https://picsum.photos/seed/anbarcoffee/400/400', 178, 22, true, NOW() - INTERVAL '9 hours'),
            (biz_perfume, '✨ عطور شرقية أصلية - دهن العود، المسك، والعنبر. أفضل الهدايا للمناسبات. توصيل لجميع المحافظات #عطور #النجف #هدايا', 'https://picsum.photos/seed/perfume1/400/400', 445, 33, true, NOW() - INTERVAL '10 hours'),
            (biz_kirkuk_electronics, 'New gaming laptops in stock! RTX 4060, 4070, 4090 available now. Installment plans up to 12 months 🎮 #Kirkuk #Gaming #Laptops', 'https://picsum.photos/seed/kirkuktech/400/400', 289, 41, true, NOW() - INTERVAL '14 hours'),
            (biz_mosul_cafe, 'جلسات خارجية رائعة مع إطلالة على النهر ☕🌊 أفضل مكان للقاء الأصدقاء في الموصل القديمة. موسيقى حية كل جمعة #الموصل #مقهى #ترفيه', 'https://picsum.photos/seed/mosulcafe/400/400', 678, 47, true, NOW() - INTERVAL '16 hours')
        ON CONFLICT DO NOTHING;
    END IF;
END $$;

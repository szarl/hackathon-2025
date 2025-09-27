-- Example chat data for testing
-- This file contains sample chat messages for testing the chat functionality

-- Insert some example chat messages for a flower
-- Replace 'your-flower-id' and 'your-user-id' with actual IDs from your database

-- Example conversation about plant care
INSERT INTO chat_messages (flower_id, user_id, role, content, created_at) VALUES
('your-flower-id', 'your-user-id', 'user', 'How often should I water my plant?', NOW() - INTERVAL '1 hour'),
('your-flower-id', 'your-user-id', 'assistant', 'For most houseplants, watering once a week is a good starting point. However, the frequency depends on factors like the plant type, pot size, soil type, and environmental conditions. Check the soil moisture by sticking your finger about an inch deep - if it feels dry, it''s time to water!', NOW() - INTERVAL '59 minutes'),
('your-flower-id', 'your-user-id', 'user', 'The leaves are turning yellow, what should I do?', NOW() - INTERVAL '30 minutes'),
('your-flower-id', 'your-user-id', 'assistant', 'Yellow leaves can indicate several issues. The most common causes are overwatering, underwatering, or nutrient deficiency. Since you mentioned watering concerns earlier, check if the soil is consistently wet or if there''s poor drainage. Also, ensure your plant is getting adequate light and consider if it needs fertilizer.', NOW() - INTERVAL '29 minutes'),
('your-flower-id', 'your-user-id', 'user', 'What type of fertilizer should I use?', NOW() - INTERVAL '10 minutes'),
('your-flower-id', 'your-user-id', 'assistant', 'For most houseplants, a balanced liquid fertilizer (like 10-10-10 or 20-20-20) works well. Apply it every 2-4 weeks during the growing season (spring and summer) and reduce or stop during fall and winter. Always follow the package instructions and dilute it to half strength to avoid burning the roots.', NOW() - INTERVAL '9 minutes');

-- Note: To use this data, you'll need to:
-- 1. Find a real flower_id from your flowers table
-- 2. Find a real user_id from your auth.users table
-- 3. Replace 'your-flower-id' and 'your-user-id' with those actual values
-- 4. Run this SQL file

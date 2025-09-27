-- Example data for flower_updates table
-- This file contains sample scan results for testing purposes

INSERT INTO flower_updates (
    id,
    flower_id,
    user_id,
    scan_image_url,
    ai_analysis,
    status,
    confidence_score,
    issue_type,
    issue_description,
    recommendations
) VALUES (
    gen_random_uuid(),
    (SELECT id FROM flowers LIMIT 1), -- Use first flower as example
    (SELECT id FROM auth.users LIMIT 1), -- Use first user as example
    'https://example.com/scan1.jpg',
    '{
        "confidence_score": 0.82,
        "issue_type": "light",
        "issue_description": "Pale, elongated leaves suggest insufficient light exposure",
        "recommendations": [
            {
                "type": "light",
                "action": "Move to brighter location (no direct sun)",
                "priority": "urgent",
                "timing": "today"
            },
            {
                "type": "water",
                "action": "Reduce watering frequency by 2 days",
                "priority": "high",
                "timing": "this_week"
            },
            {
                "type": "monitor",
                "action": "Monitor leaf color changes",
                "priority": "low",
                "timing": "ongoing"
            }
        ]
    }'::jsonb,
    'completed',
    0.82,
    'light',
    'Pale, elongated leaves suggest insufficient light exposure',
    '[
        {
            "type": "light",
            "action": "Move to brighter location (no direct sun)",
            "priority": "urgent",
            "timing": "today"
        },
        {
            "type": "water",
            "action": "Reduce watering frequency by 2 days",
            "priority": "high",
            "timing": "this_week"
        },
        {
            "type": "monitor",
            "action": "Monitor leaf color changes",
            "priority": "low",
            "timing": "ongoing"
        }
    ]'::jsonb
);

-- Add another example with different issue type
INSERT INTO flower_updates (
    id,
    flower_id,
    user_id,
    scan_image_url,
    ai_analysis,
    status,
    confidence_score,
    issue_type,
    issue_description,
    recommendations
) VALUES (
    gen_random_uuid(),
    (SELECT id FROM flowers LIMIT 1 OFFSET 1), -- Use second flower as example
    (SELECT id FROM auth.users LIMIT 1), -- Use first user as example
    'https://example.com/scan2.jpg',
    '{
        "confidence_score": 0.75,
        "issue_type": "water",
        "issue_description": "Yellowing leaves and wilting indicate overwatering",
        "recommendations": [
            {
                "type": "water",
                "action": "Reduce watering frequency by 3 days",
                "priority": "urgent",
                "timing": "today"
            },
            {
                "type": "soil",
                "action": "Check soil drainage",
                "priority": "high",
                "timing": "this_week"
            },
            {
                "type": "monitor",
                "action": "Watch for root rot signs",
                "priority": "high",
                "timing": "ongoing"
            }
        ]
    }'::jsonb,
    'completed',
    0.75,
    'water',
    'Yellowing leaves and wilting indicate overwatering',
    '[
        {
            "type": "water",
            "action": "Reduce watering frequency by 3 days",
            "priority": "urgent",
            "timing": "today"
        },
        {
            "type": "soil",
            "action": "Check soil drainage",
            "priority": "high",
            "timing": "this_week"
        },
        {
            "type": "monitor",
            "action": "Watch for root rot signs",
            "priority": "high",
            "timing": "ongoing"
        }
    ]'::jsonb
);

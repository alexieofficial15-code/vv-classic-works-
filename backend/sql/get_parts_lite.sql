-- ==============================================================================
-- SQL View and RPC for Lightweight Spare Parts Catalog (getPartsLite)
-- ==============================================================================
-- Purpose:
-- 1. Returns lightweight spare_parts columns without heavy base64 image strings.
-- 2. Keeps specifications JSONB array while filtering out internal '__meta' entry.
-- 3. Derives image_count dynamically:
--    (1 if main image is present) + (count of elements in __meta.additionalImages).
-- ==============================================================================

-- 1. Create or replace the view: parts_lite_view
CREATE OR REPLACE VIEW parts_lite_view AS
SELECT 
    p.id,
    p.title,
    p.price,
    p.category,
    p.car_model_id,
    p.car_model_name,
    p.era,
    p.engine_type,
    p.engine_type AS engine_size,
    p.oem_number,
    p.casting_code,
    p.in_stock,
    p.stock,
    p.stock AS stock_count,
    p.created_at,
    p.condition,
    p.rarity_score,
    p.rating,
    p.reviews_count,
    -- Specifications with __meta entry removed
    COALESCE(
        (
            SELECT jsonb_agg(elem)
            FROM jsonb_array_elements(
                CASE 
                    WHEN jsonb_typeof(p.specifications) = 'array' THEN p.specifications
                    ELSE '[]'::jsonb
                END
            ) AS elem
            WHERE elem->>'key' != '__meta'
        ),
        '[]'::jsonb
    ) AS specifications,
    -- Dynamic image_count: main image (1) + additionalImages from __meta
    (
        CASE 
            WHEN p.image IS NOT NULL AND length(trim(p.image)) > 0 THEN 1 
            ELSE 0 
        END
        +
        COALESCE(
            (
                SELECT 
                    CASE 
                        -- When __meta.value is already a parsed JSON object
                        WHEN jsonb_typeof((elem->'value')->'additionalImages') = 'array' 
                            THEN jsonb_array_length((elem->'value')->'additionalImages')
                        -- When __meta.value is a JSON string
                        WHEN jsonb_typeof(elem->'value') = 'string' AND (elem->>'value') ~ '^\s*\{.*\}\s*$'
                            THEN COALESCE(jsonb_array_length(((elem->>'value')::jsonb)->'additionalImages'), 0)
                        ELSE 0
                    END
                FROM jsonb_array_elements(
                    CASE 
                        WHEN jsonb_typeof(p.specifications) = 'array' THEN p.specifications
                        ELSE '[]'::jsonb
                    END
                ) AS elem
                WHERE elem->>'key' = '__meta'
                LIMIT 1
            ),
            0
        )
    )::integer AS image_count
FROM spare_parts p
ORDER BY p.created_at DESC;

-- 2. Optional RPC function for bounded queries with limit
CREATE OR REPLACE FUNCTION get_parts_lite(limit_count integer DEFAULT 200)
RETURNS SETOF parts_lite_view
LANGUAGE sql
STABLE
AS $$
    SELECT * FROM parts_lite_view LIMIT limit_count;
$$;

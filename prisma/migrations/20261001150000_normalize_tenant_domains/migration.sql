-- Store allowed domains as bare origins (scheme://host[:port]), the form
-- browsers send in the Origin header and the form the API now saves.
-- Entries that aren't http(s) URLs are left exactly as they are.
UPDATE "Tenant" t
SET domains = (
  SELECT array_agg(DISTINCT o)
  FROM (
    SELECT CASE
      WHEN lower(d) ~ '^https?://[^/?#]+' THEN
        regexp_replace(
          regexp_replace(substring(lower(d) FROM '^(https?://[^/?#]+)'), '^(https://[^/:]+):443$', '\1'),
          '^(http://[^/:]+):80$', '\1')
      ELSE d
    END AS o
    FROM unnest(t.domains) AS d
  ) AS normalized
)
WHERE EXISTS (
  SELECT 1 FROM unnest(t.domains) AS d
  WHERE d !~ '^https?://[^/?#]+$' OR d <> lower(d) OR d ~ '^(https://[^/]+:443|http://[^/]+:80)$'
);

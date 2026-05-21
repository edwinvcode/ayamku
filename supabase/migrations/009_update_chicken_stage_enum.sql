-- Update chicken_stage enum to match current codebase
-- Old values: doc, grower, layer, broiler, breeder, harvested
-- New values: starter, grower, layer, afkir, indukan, harvested

ALTER TYPE chicken_stage ADD VALUE IF NOT EXISTS 'starter';
ALTER TYPE chicken_stage ADD VALUE IF NOT EXISTS 'afkir';
ALTER TYPE chicken_stage ADD VALUE IF NOT EXISTS 'indukan';

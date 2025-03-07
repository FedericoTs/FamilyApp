-- Alter the family_members table to replace age_range with birthdate
ALTER TABLE family_members
ADD COLUMN birthdate DATE;

-- Create a function to calculate age range based on birthdate
CREATE OR REPLACE FUNCTION calculate_age_range(birthdate DATE) 
RETURNS TEXT AS $$
DECLARE
    age_in_years INTEGER;
BEGIN
    age_in_years := EXTRACT(YEAR FROM AGE(CURRENT_DATE, birthdate));
    
    IF age_in_years < 1 THEN
        RETURN 'infant';
    ELSIF age_in_years BETWEEN 1 AND 3 THEN
        RETURN 'toddler';
    ELSIF age_in_years BETWEEN 3 AND 5 THEN
        RETURN 'preschool';
    ELSIF age_in_years BETWEEN 6 AND 12 THEN
        RETURN 'child';
    ELSIF age_in_years BETWEEN 13 AND 17 THEN
        RETURN 'teen';
    ELSE
        RETURN 'adult';
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Create a view that includes the calculated age range
CREATE OR REPLACE VIEW family_members_with_age_range AS
SELECT 
    id,
    profile_id,
    name,
    relationship,
    birthdate,
    calculate_age_range(birthdate) as age_range,
    created_at,
    updated_at
FROM family_members;

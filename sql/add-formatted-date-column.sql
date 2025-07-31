-- Add formatted_date column to usage_requests table
-- This column stores the actual formatted date returned to the user

ALTER TABLE usage_requests 
ADD COLUMN formatted_date VARCHAR(255);

-- Update the column comment for documentation
COMMENT ON COLUMN usage_requests.formatted_date IS 'The actual formatted date returned to the user in the webhook response';
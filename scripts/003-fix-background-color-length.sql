-- Increase background_color column length to accommodate color keys
ALTER TABLE ideas ALTER COLUMN background_color TYPE VARCHAR(50);

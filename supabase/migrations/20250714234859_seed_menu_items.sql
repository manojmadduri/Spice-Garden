-- Seed menu_items: clear existing data and insert initial menu records
BEGIN;

-- First, clear existing data to avoid conflicts
DELETE FROM public.menu_items;

-- Insert all menu items with proper categories and details
INSERT INTO public.menu_items (name, description, price, category, is_veg, spice_level, available, image_url) VALUES
  -- Appetizers
  ('Samosas', 'Crispy pastries filled with spiced potatoes and peas', 6.99, 'appetizers', true, 'mild', true, '🥟'),
  ('Chicken Tikka', 'Tender chicken pieces marinated in yogurt and spices', 9.99, 'appetizers', false, 'medium', true, '🍗'),
  ('Paneer Tikka', 'Grilled cottage cheese cubes with bell peppers and onions', 8.99, 'appetizers', true, 'medium', true, '🧀'),

  -- Main Course
  ('Butter Chicken', 'Creamy tomato-based curry with tender chicken pieces', 16.99, 'mains', false, 'mild', true, '🍛'),
  ('Paneer Butter Masala', 'Rich and creamy curry with soft cottage cheese cubes', 14.99, 'mains', true, 'mild', true, '🧀'),
  ('Lamb Vindaloo', 'Spicy Goan curry with tender lamb and potatoes', 18.99, 'mains', false, 'hot', true, '🍖'),
  ('Tandoori Chicken', 'Marinated chicken cooked in traditional clay oven', 16.99, 'mains', false, 'medium', true, '🍗'),

  -- Rice & Biryani
  ('Chicken Biryani', 'Aromatic basmati rice layered with spiced chicken', 17.99, 'rice', false, 'medium', true, '🍛'),
  ('Vegetable Biryani', 'Fragrant rice with mixed vegetables and nuts', 15.99, 'rice', true, 'mild', true, '🍛'),

  -- Breads
  ('Garlic Naan', 'Soft bread topped with garlic and cilantro', 3.99, 'breads', true, 'mild', true, '🫓'),
  ('Butter Naan', 'Classic Indian bread brushed with butter', 3.49, 'breads', true, 'mild', true, '🫓'),

  -- Desserts
  ('Gulab Jamun', 'Sweet milk dumplings in rose-flavored syrup', 5.99, 'desserts', true, 'mild', true, '🍡'),
  ('Kulfi', 'Traditional Indian ice cream with pistachios', 4.99, 'desserts', true, 'mild', true, '🍦'),

  -- Beverages
  ('Mango Lassi', 'Creamy yogurt drink blended with sweet mango', 4.49, 'beverages', true, 'mild', true, '🥤'),
  ('Masala Chai', 'Spiced tea with cardamom, ginger, and cinnamon', 2.99, 'beverages', true, 'mild', true, '☕');

COMMIT;

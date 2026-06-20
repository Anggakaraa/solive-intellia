-- Fix OMNIKOPI'S KLEPON LAVA CAKE mis-categorized as 'Dips' in POS export
-- It is a dessert — correct the pos_category on all affected rows

UPDATE sales_items
SET    pos_category = 'Desserts'
WHERE  raw_dish_name = 'OMNIKOPI''S KLEPON LAVA CAKE'
  AND  pos_category  = 'Dips';

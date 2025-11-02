-- Migration: Grant public access to products and orders
-- Description: Allow anonymous users to view products and create orders

-- Grant SELECT on products for anonymous users (viewing catalog)
grant select on public.products to anon, authenticated;

-- Grant INSERT on orders for anonymous users (creating orders via WhatsApp)
grant select, insert on public.orders to anon, authenticated;

-- Grant usage on sequences (needed for inserting orders)
grant usage, select on sequence public.orders_id_seq to anon, authenticated;

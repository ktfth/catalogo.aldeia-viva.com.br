-- Migration: Setup Storage Buckets and RLS Policies
-- Description: Configure buckets for product images, store logos, and user avatars with appropriate access policies

-- Create storage buckets (if not created by config.toml)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('product-images', 'product-images', true, 5242880, array['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/gif']),
  ('store-logos', 'store-logos', true, 2097152, array['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/svg+xml']),
  ('avatars', 'avatars', true, 1048576, array['image/png', 'image/jpeg', 'image/jpg', 'image/webp'])
on conflict (id) do nothing;

-- ============================================================================
-- PRODUCT IMAGES BUCKET POLICIES
-- ============================================================================

-- Policy: Anyone can view product images (public bucket)
create policy "Public Access for Product Images"
on storage.objects for select
using (bucket_id = 'product-images');

-- Policy: Store owners can upload product images to their store folder
create policy "Store owners can upload product images"
on storage.objects for insert
with check (
  bucket_id = 'product-images'
  and (storage.foldername(name))[1] = get_current_user_store()::text
  and auth.role() = 'authenticated'
);

-- Policy: Store owners can update their own product images
create policy "Store owners can update their product images"
on storage.objects for update
using (
  bucket_id = 'product-images'
  and (storage.foldername(name))[1] = get_current_user_store()::text
  and auth.role() = 'authenticated'
);

-- Policy: Store owners can delete their own product images
create policy "Store owners can delete their product images"
on storage.objects for delete
using (
  bucket_id = 'product-images'
  and (storage.foldername(name))[1] = get_current_user_store()::text
  and auth.role() = 'authenticated'
);

-- ============================================================================
-- STORE LOGOS BUCKET POLICIES
-- ============================================================================

-- Policy: Anyone can view store logos (public bucket)
create policy "Public Access for Store Logos"
on storage.objects for select
using (bucket_id = 'store-logos');

-- Policy: Store owners can upload their store logo
create policy "Store owners can upload store logo"
on storage.objects for insert
with check (
  bucket_id = 'store-logos'
  and (storage.foldername(name))[1] = get_current_user_store()::text
  and auth.role() = 'authenticated'
);

-- Policy: Store owners can update their store logo
create policy "Store owners can update store logo"
on storage.objects for update
using (
  bucket_id = 'store-logos'
  and (storage.foldername(name))[1] = get_current_user_store()::text
  and auth.role() = 'authenticated'
);

-- Policy: Store owners can delete their store logo
create policy "Store owners can delete store logo"
on storage.objects for delete
using (
  bucket_id = 'store-logos'
  and (storage.foldername(name))[1] = get_current_user_store()::text
  and auth.role() = 'authenticated'
);

-- ============================================================================
-- AVATARS BUCKET POLICIES
-- ============================================================================

-- Policy: Anyone can view avatars (public bucket)
create policy "Public Access for Avatars"
on storage.objects for select
using (bucket_id = 'avatars');

-- Policy: Users can upload their own avatar
create policy "Users can upload own avatar"
on storage.objects for insert
with check (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = auth.uid()::text
  and auth.role() = 'authenticated'
);

-- Policy: Users can update their own avatar
create policy "Users can update own avatar"
on storage.objects for update
using (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = auth.uid()::text
  and auth.role() = 'authenticated'
);

-- Policy: Users can delete their own avatar
create policy "Users can delete own avatar"
on storage.objects for delete
using (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = auth.uid()::text
  and auth.role() = 'authenticated'
);

-- ============================================================================
-- ADMIN OVERRIDE POLICIES (for all buckets)
-- ============================================================================

-- Policy: Admins can manage all images in all buckets
create policy "Admins can manage all storage objects"
on storage.objects for all
using (is_admin())
with check (is_admin());

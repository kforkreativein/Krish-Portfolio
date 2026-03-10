-- Add B&W logo columns to clients table
-- Run this in the Supabase SQL editor

alter table clients add column if not exists logo_bw_url text default null;
alter table clients add column if not exists use_bw boolean default false;

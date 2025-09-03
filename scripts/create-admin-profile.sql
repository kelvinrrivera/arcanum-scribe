-- SQL script to create admin profile for kelvinrrivera@gmail.com
-- Run this in the Supabase SQL Editor

-- Insert the admin profile
INSERT INTO public.profiles (
  user_id,
  email,
  display_name,
  subscription_tier,
  credits_remaining,
  monthly_generations,
  created_at,
  updated_at
) VALUES (
  '39cc4a6f-a6c4-4467-88a4-0bafcdc52082',
  'kelvinrrivera@gmail.com',
  'Kelvin Rivera',
  'archmage',
  1000,
  500,
  NOW(),
  NOW()
) ON CONFLICT (user_id) 
DO UPDATE SET
  subscription_tier = 'archmage',
  credits_remaining = 1000,
  monthly_generations = 500,
  updated_at = NOW();

-- Verify the profile was created/updated
SELECT 
  user_id,
  email,
  display_name,
  subscription_tier,
  credits_remaining,
  monthly_generations,
  created_at,
  updated_at
FROM public.profiles 
WHERE user_id = '39cc4a6f-a6c4-4467-88a4-0bafcdc52082'; 
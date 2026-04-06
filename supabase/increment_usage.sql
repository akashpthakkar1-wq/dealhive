-- Run this in Supabase SQL Editor after the main schema
-- Creates an RPC function to safely increment usage_count

CREATE OR REPLACE FUNCTION increment_usage(coupon_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE coupons SET usage_count = usage_count + 1 WHERE id = coupon_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

import { supabase } from "@/integrations/supabase/client";

export interface Listing {
  id: string;
  user_id: string;
  title: string;
  description: string;
  category: string;
  price_per_unit: number | null;
  location: string;
  status: 'active' | 'inactive' | 'archived';
  images: any;
  views_count: number;
  clicks_count: number;
  created_at: string;
  updated_at: string;
}

export interface Subscription {
  id: string;
  user_id: string;
  status: 'active' | 'cancelled' | 'expired';
  current_period_start: string;
  current_period_end: string;
  next_billing_date: string | null;
  stripe_subscription_id: string | null;
  cancel_at_period_end: boolean;
  created_at: string;
  updated_at: string;
}

// Listings
export async function getActiveListing(listingId: string): Promise<Listing | null> {
  const { data, error } = await supabase
    .from('marketplace_listings')
    .select('*')
    .eq('id', listingId)
    .eq('status', 'active')
    .single();

  if (error) {
    console.error('Error fetching listing:', error);
    return null;
  }

  return data;
}

export async function getUserListings(userId: string): Promise<Listing[]> {
  const { data, error } = await supabase
    .from('marketplace_listings')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching user listings:', error);
    return [];
  }

  return data || [];
}

export async function createListing(listing: Omit<Listing, 'id' | 'views_count' | 'clicks_count' | 'created_at' | 'updated_at'>): Promise<Listing | null> {
  const { data, error } = await supabase
    .from('marketplace_listings')
    .insert([listing])
    .select()
    .single();

  if (error) {
    console.error('Error creating listing:', error);
    return null;
  }

  return data;
}

export async function updateListing(listingId: string, updates: Partial<Listing>): Promise<Listing | null> {
  const { data, error } = await supabase
    .from('marketplace_listings')
    .update(updates)
    .eq('id', listingId)
    .select()
    .single();

  if (error) {
    console.error('Error updating listing:', error);
    return null;
  }

  return data;
}

export async function deleteListing(listingId: string): Promise<boolean> {
  const { error } = await supabase
    .from('marketplace_listings')
    .delete()
    .eq('id', listingId);

  if (error) {
    console.error('Error deleting listing:', error);
    return false;
  }

  return true;
}

// Subscriptions
export async function getUserSubscription(userId: string): Promise<Subscription | null> {
  const { data, error } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'active')
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null; // No active subscription
    }
    console.error('Error fetching subscription:', error);
    return null;
  }

  return data;
}

export async function createSubscription(
  userId: string,
  periodStart: Date,
  periodEnd: Date,
  stripeSubscriptionId: string
): Promise<Subscription | null> {
  const { data, error } = await supabase
    .from('subscriptions')
    .insert([{
      user_id: userId,
      status: 'active',
      current_period_start: periodStart.toISOString(),
      current_period_end: periodEnd.toISOString(),
      next_billing_date: periodEnd.toISOString(),
      stripe_subscription_id: stripeSubscriptionId,
    }])
    .select()
    .single();

  if (error) {
    console.error('Error creating subscription:', error);
    return null;
  }

  return data;
}

export async function cancelSubscription(userId: string): Promise<boolean> {
  const { error } = await supabase
    .from('subscriptions')
    .update({ status: 'cancelled', cancel_at_period_end: true })
    .eq('user_id', userId)
    .eq('status', 'active');

  if (error) {
    console.error('Error cancelling subscription:', error);
    return false;
  }

  return true;
}

// Featured Listings
export async function featureListing(
  listingId: string,
  durationDays: number = 30
): Promise<boolean> {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + durationDays);

  const { error } = await supabase
    .from('featured_listings')
    .insert([{
      listing_id: listingId,
      expires_at: expiresAt.toISOString(),
    }]);

  if (error) {
    console.error('Error featuring listing:', error);
    return false;
  }

  return true;
}

export async function getFeaturedListings(limit: number = 10): Promise<string[]> {
  const { data, error } = await supabase
    .from('featured_listings')
    .select('listing_id')
    .eq('status', 'active')
    .gt('expires_at', new Date().toISOString())
    .limit(limit);

  if (error) {
    console.error('Error fetching featured listings:', error);
    return [];
  }

  return data?.map(f => f.listing_id) || [];
}

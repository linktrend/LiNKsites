import { createClient } from '@/utils/supabase/server';
import {
  getProducts,
  getSubscription,
  getUser
} from '@/utils/supabase/queries';
import { cookies } from 'next/headers';
import { User } from '@supabase/supabase-js';
import PricingRounded from './pricing-rounded';
import { ProductWithPrices, SubscriptionWithProduct } from '@starter/types';

export default async function PricingPage() {
  const supabase = createClient();
  const [user, products] = await Promise.all([
    getUser(),
    getProducts(),
  ]);

  const subscription = user ? await getSubscription() : null;

  return (
    <PricingRounded
      user={user as User | null}
      products={products ?? []}
      subscription={subscription}
    />
  );
}

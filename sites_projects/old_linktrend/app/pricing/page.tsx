import { createClient } from '@/utils/supabase/server';
import {
  getProducts,
  getSubscription,
  getUser
} from '@/utils/supabase/queries';
import { User } from '@supabase/supabase-js';
import { PricingPageContent } from '@/components/sections/PricingPageContent';

export default async function PricingPage() {
  const supabase = createClient();
  const [user, products] = await Promise.all([
    getUser(),
    getProducts(),
  ]);

  const subscription = user ? await getSubscription() : null;

  return (
    <PricingPageContent
      user={user as User | null}
      products={products ?? []}
      subscription={subscription}
    />
  );
}

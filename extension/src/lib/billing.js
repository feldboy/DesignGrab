/**
 * DesignGrab — Billing Module
 * Handles upgrade flow via Stripe checkout.
 */

import { getSupabase, isSupabaseConfigured } from './supabase.js';

const SUPABASE_URL = 'https://lgueqndrxxkcssjclyxp.supabase.co';

/**
 * Start upgrade checkout flow
 * @param {'starter'|'pro'|'lifetime'} plan
 */
export async function startUpgrade(plan) {
    if (!isSupabaseConfigured()) {
        window.open('https://designgrab.app/pricing', '_blank');
        return;
    }

    const supabase = await getSupabase();
    if (!supabase) {
        window.open('https://designgrab.app/pricing', '_blank');
        return;
    }

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
        // Not logged in — send to pricing page
        window.open('https://designgrab.app/pricing', '_blank');
        return;
    }

    try {
        const res = await fetch(`${SUPABASE_URL}/functions/v1/stripe-checkout`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session.access_token}`,
            },
            body: JSON.stringify({
                plan,
                successUrl: 'https://designgrab.app/success?session_id={CHECKOUT_SESSION_ID}',
                cancelUrl: 'https://designgrab.app/pricing',
            }),
        });

        const data = await res.json();
        if (data.url) {
            window.open(data.url, '_blank');
        } else {
            console.error('[DesignGrab] Checkout error:', data.error);
            window.open('https://designgrab.app/pricing', '_blank');
        }
    } catch (err) {
        console.error('[DesignGrab] Checkout error:', err);
        window.open('https://designgrab.app/pricing', '_blank');
    }
}

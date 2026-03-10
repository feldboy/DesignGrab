/**
 * DesignGrab — Billing Module
 * Handles upgrade flow via Stripe checkout.
 */

import { getSupabase, isSupabaseConfigured } from './supabase.js';
import { SUPABASE_URL } from '../config/env.js';

/**
 * Start upgrade checkout flow
 * @param {'pro'|'lifetime'} plan
 */
export async function startUpgrade(plan) {
    window.open('https://landing-nine-vert.vercel.app/pricing', '_blank');
}

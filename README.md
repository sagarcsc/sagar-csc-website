# SAGAR CSC website starter

This is a fresh starter rebuild with a basic services page and Razorpay checkout integration through Netlify server functions.

## Before publishing
1. Run `supabase-schema.sql` in Supabase SQL Editor. If an older `orders` table already exists, carefully reconcile the schema first; don't blindly drop data.
2. In Razorpay, complete account/KYC and activate the payment gateway. Test first using Test Mode.
3. Deploy this folder to Netlify (best connected to GitHub).
4. Set these Netlify Environment Variables:
   - `SUPABASE_URL` (Project URL)
   - `SUPABASE_SERVICE_ROLE_KEY` (Supabase secret/service role key — server functions only, never in browser)
   - `RAZORPAY_KEY_ID`
   - `RAZORPAY_KEY_SECRET` (server functions only)
5. In Netlify, redeploy after adding environment variables.
6. Use Razorpay Test Mode credentials and verify the flow before switching to Live Mode.

## GitHub upload
Upload all files and folders in this project to your repository. Keep the `netlify/functions` folder intact. Do not upload secrets, credentials, or `.env` files.

## Important
- The sample catalog is informational. Confirm service availability and fee with CSC before payment.
- This starter is not a finished production business system. Add admin authentication, abuse/rate-limiting, order notification, refund handling, and privacy/legal pages before relying on it for production.
- Never expose the Supabase service-role key or Razorpay secret in frontend code or public GitHub.

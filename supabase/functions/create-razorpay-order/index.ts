import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { createClient } from 'jsr:@supabase/supabase-js';
import Razorpay from 'https://cdn.skypack.dev/razorpay';

// Define CORS headers to allow requests from your web app.
// This is crucial for security and for the browser to allow the request.
const corsHeaders = {
  'Access-Control-Allow-Origin': '*', // Allow any origin
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // The browser sends an OPTIONS request first to check if the server allows
  // the actual request. This is called a "preflight" request.
  // We must handle it and respond with the correct CORS headers.
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // The rest of the logic only runs for non-OPTIONS requests (e.g., POST).
    const { cart, user_id } = await req.json();

    if (!cart || !user_id) {
      return new Response(JSON.stringify({ error: 'Missing cart or user_id' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // IMPORTANT: The function will crash if these secrets are not set
    // in your Supabase project's Edge Function settings.
    const RAZORPAY_KEY_ID = Deno.env.get('RAZORPAY_KEY_ID');
    const RAZORPAY_KEY_SECRET = Deno.env.get('RAZORPAY_KEY_SECRET');
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
        throw new Error("Missing one or more required environment variables/secrets.");
    }

    const razorpay = new Razorpay({
      key_id: RAZORPAY_KEY_ID,
      key_secret: RAZORPAY_KEY_SECRET,
    });

    const supabaseAdmin = createClient(
      SUPABASE_URL,
      SUPABASE_SERVICE_ROLE_KEY
    );

    // 1. Fetch prices from the database to calculate the total securely
    const itemIds = cart.map((item: any) => item.id);
    const { data: menuItems, error: fetchError } = await supabaseAdmin
      .from('menu_items')
      .select('id, price')
      .in('id', itemIds);

    if (fetchError) throw fetchError;

    const totalAmount = cart.reduce((acc: number, cartItem: any) => {
      const menuItem = menuItems.find((item) => item.id === cartItem.id);
      return acc + (menuItem?.price || 0) * cartItem.quantity;
    }, 0);

    // 2. Create a Razorpay order
    const orderOptions = {
      amount: Math.round(totalAmount * 100), // Amount in paise
      currency: 'INR',
      receipt: `receipt_order_${new Date().getTime()}`,
    };

    const razorpayOrder = await razorpay.orders.create(orderOptions);

    // 3. Save the pending order to your database
    const { data: newOrder, error: insertError } = await supabaseAdmin
      .from('orders')
      .insert({
        user_id,
        items: cart,
        total_amount: totalAmount,
        status: 'pending',
        razorpay_order_id: razorpayOrder.id,
      })
      .select()
      .single();

    if (insertError) throw insertError;

    // Return the order details with CORS headers
    return new Response(JSON.stringify({ orderId: razorpayOrder.id, dbOrderId: newOrder.id }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    // Log the actual error to the Supabase function logs for debugging.
    console.error('An error occurred:', error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

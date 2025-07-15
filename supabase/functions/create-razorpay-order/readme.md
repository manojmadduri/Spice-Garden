I have already created the code for the Supabase Edge Function. Since you cannot deploy it from the command line without Docker, here are the step-by-step instructions to create it manually in your Supabase dashboard:

### Step 1: Create the Edge Function

1. Go to your Supabase project dashboard.
2. In the left sidebar, click on the __Edge Functions__ icon (it looks like a lambda symbol: __λ__).
3. Click the __"Create a function"__ button.
4. For the __Function name__, enter `create-razorpay-order`.
5. Click __"Create function"__.

### Step 2: Add the Function Code

1. You will be taken to the code editor for your new function.
2. __Delete all the boilerplate code__ that is already in the editor.
3. Copy the entire code block below and paste it into the empty editor.

import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { createClient } from 'jsr:@supabase/supabase-js';
import Razorpay from 'https://cdn.skypack.dev/razorpay';

Deno.serve(async (req) => {
  const { cart, user_id } = await req.json();

  if (!cart || !user_id) {
    return new Response(JSON.stringify({ error: 'Missing cart or user_id' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const RAZORPAY_KEY_ID = Deno.env.get('RAZORPAY_KEY_ID')!;
  const RAZORPAY_KEY_SECRET = Deno.env.get('RAZORPAY_KEY_SECRET')!;
  const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
  const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

  const razorpay = new Razorpay({
    key_id: RAZORPAY_KEY_ID,
    key_secret: RAZORPAY_KEY_SECRET,
  });

  const supabaseAdmin = createClient(
    SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY
  );

  try {
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

    return new Response(JSON.stringify({ orderId: razorpayOrder.id, dbOrderId: newOrder.id }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error creating order:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});

4. Click the __"Save and deploy"__ button in the top right corner.

### Step 3: Set the Environment Variables (Secrets)

1. After the function is deployed, go to the __Settings__ for the function.

2. Click on __"Secrets"__.

3. Click __"Add a new secret"__ and add the following four secrets one by one:

   - __Name:__ `RAZORPAY_KEY_ID`
     - __Value:__ *Your Razorpay Key ID*
   - __Name:__ `RAZORPAY_KEY_SECRET`
     - __Value:__ *Your Razorpay Key Secret*
   - __Name:__ `SUPABASE_URL`
     - __Value:__ *Your Supabase project URL (from the `.env.example` file)*
   - __Name:__ `SUPABASE_SERVICE_ROLE_KEY`
     - __Value:__ *The `service_role` key you provided earlier*

Once you have completed these steps, the secure payment processing will be fully configured and ready to use.

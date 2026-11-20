const Razorpay = require("razorpay");
const { createClient } = require("@supabase/supabase-js");
const crypto = require("crypto");
exports.handler = async (event) => {
 if(event.httpMethod!=="POST")return {statusCode:405,body:"Method not allowed"};
 try{
  const {name,phone,service,amount}=JSON.parse(event.body||"{}");const rupees=Number(amount);
  if(!name||!phone||!service||!Number.isFinite(rupees)||rupees<1||rupees>100000)return {statusCode:400,body:JSON.stringify({error:"Invalid order details"})};
  const rpKey=process.env.RAZORPAY_KEY_ID,rpSecret=process.env.RAZORPAY_KEY_SECRET,supabaseUrl=process.env.SUPABASE_URL,supabaseSecret=process.env.SUPABASE_SERVICE_ROLE_KEY;
  if(!rpKey||!rpSecret||!supabaseUrl||!supabaseSecret)return {statusCode:500,body:JSON.stringify({error:"Server payment configuration is incomplete"})};
  const razorpay=new Razorpay({key_id:rpKey,key_secret:rpSecret}),db=createClient(supabaseUrl,supabaseSecret),orderRef="CSC-"+crypto.randomBytes(5).toString("hex").toUpperCase();
  const order=await razorpay.orders.create({amount:Math.round(rupees*100),currency:"INR",receipt:orderRef});
  const {error}=await db.from("orders").insert({customer_name:name,phone,service_name:service,amount:rupees,status:"pending",payment_status:"pending",razorpay_order_id:order.id,order_ref:orderRef});
  if(error)throw error;
  return {statusCode:200,headers:{"Content-Type":"application/json"},body:JSON.stringify({key_id:rpKey,amount:order.amount,razorpay_order_id:order.id,order_ref:orderRef})};
 }catch(e){return {statusCode:500,body:JSON.stringify({error:"Could not create order"})};}
};
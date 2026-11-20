const services = [
  {name:"PAN Card Assistance",description:"Assistance with PAN application or correction.",fee:null},
  {name:"Aadhaar Assistance",description:"Help with Aadhaar-related online services.",fee:null},
  {name:"Online Form Filling",description:"Online form filling and submission assistance.",fee:null},
  {name:"Print & Document Services",description:"Document printing and digital file assistance.",fee:null},
  {name:"Certificate/Application Help",description:"Assistance with selected online applications.",fee:null},
  {name:"Other CSC Service",description:"Ask us about a service not listed here.",fee:null}
];
const grid=document.getElementById("service-grid");
const select=document.getElementById("service-select");
services.forEach((s,i)=>{
  const card=document.createElement("article");card.className="service";
  card.innerHTML=`<h3>${s.name}</h3><p>${s.description}</p><div class="fee">Fee confirmed before payment</div><button class="primary" type="button" data-service="${i}">Request service</button>`;
  grid.append(card);
  const option=document.createElement("option");option.value=s.name;option.textContent=s.name;select.append(option);
});
grid.addEventListener("click",e=>{
  const btn=e.target.closest("[data-service]");if(!btn)return;
  select.value=services[Number(btn.dataset.service)].name;
  document.getElementById("order").scrollIntoView({behavior:"smooth"});
});
document.getElementById("year").textContent=new Date().getFullYear();
const form=document.getElementById("order-form"),statusEl=document.getElementById("status");
form.addEventListener("submit",async e=>{
  e.preventDefault();statusEl.className="status";statusEl.textContent="Preparing secure payment…";
  const name=form.elements.name.value.trim(),phone=form.elements.phone.value.trim(),service=form.elements.service.value,amount=Number(form.elements.amount.value);
  if(!name||!phone||!service||!Number.isFinite(amount)||amount<1){statusEl.textContent="Please enter valid details and a fee.";statusEl.classList.add("error");return;}
  try{
    const res=await fetch("/.netlify/functions/create-payment-order",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({name,phone,service,amount})});
    const data=await res.json();if(!res.ok)throw new Error(data.error||"Could not create payment order");
    const options={key:data.key_id,amount:data.amount,currency:"INR",name:"SAGAR CSC",description:service,order_id:data.razorpay_order_id,
      prefill:{name,contact:phone},theme:{color:"#203d86"},
      handler:async response=>{
        statusEl.textContent="Verifying payment…";
        try{
          const verify=await fetch("/.netlify/functions/verify-payment",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({...response,order_ref:data.order_ref})});
          const result=await verify.json();if(!verify.ok)throw new Error(result.error||"Verification failed");
          statusEl.textContent="Payment verified. Your order reference: "+data.order_ref+". Please contact SAGAR CSC if you need assistance.";statusEl.classList.add("success");form.reset();
        }catch(err){statusEl.textContent="Payment submitted but verification response failed. Please contact CSC with payment ID: "+response.razorpay_payment_id;statusEl.classList.add("error");}
      },
      modal:{ondismiss:()=>{statusEl.textContent="Payment window closed. No payment was confirmed.";}}
    };
    new Razorpay(options).open();
  }catch(err){statusEl.textContent=err.message+" — setup keys and server functions first.";statusEl.classList.add("error");}
});
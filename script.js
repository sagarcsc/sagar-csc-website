const defaultServices=[
{name:"PAN Card Assistance",description:"Assistance with PAN applications and corrections."},
{name:"Aadhaar Assistance",description:"Guidance for eligible Aadhaar services. Never share OTPs."},
{name:"Online Form Filling",description:"Help filling online application forms."},
{name:"Print & Document Services",description:"Printing, scanning and document assistance."},
{name:"Passport Assistance",description:"Guidance with passport application process."},
{name:"Certificate/Application Help",description:"Help with selected certificate applications."},
{name:"Bill Payment Assistance",description:"Assistance with selected bill payments."},
{name:"Other CSC Service",description:"Ask about a service not listed."}
];
let services; try{services=JSON.parse(localStorage.getItem("sagar_csc_services")||"null")||defaultServices;}catch(e){services=defaultServices;}
function saveServices(){localStorage.setItem("sagar_csc_services",JSON.stringify(services));}
function go(id){document.querySelectorAll("main section").forEach(s=>s.classList.add("hidden"));const target=document.getElementById(id);if(target)target.classList.remove("hidden");window.scrollTo({top:0,behavior:"smooth"});}
const grid=document.getElementById("service-grid"),select=document.getElementById("service-select");
services.forEach((s,i)=>{const card=document.createElement("article");card.className="service";const h=document.createElement("h3");h.textContent=s.name;const p=document.createElement("p");p.textContent=s.description;const fee=document.createElement("p");fee.className="muted";fee.textContent="Fee confirmed before payment";const btn=document.createElement("button");btn.type="button";btn.textContent="Request service";btn.addEventListener("click",()=>{select.value=s.name;go("order")});card.append(h,p,fee,btn);grid.append(card);const op=document.createElement("option");op.value=s.name;op.textContent=s.name;select.append(op);});
const form=document.getElementById("order-form"),statusEl=document.getElementById("status");
form.addEventListener("submit",async e=>{e.preventDefault();statusEl.textContent="Preparing payment…";statusEl.className="status";const name=form.elements.name.value.trim(),phone=form.elements.phone.value.trim(),service=form.elements.service.value,amount=Number(form.elements.amount.value);if(!/^[0-9]{10}$/.test(phone)||!name||!service||!Number.isFinite(amount)||amount<1){statusEl.textContent="Please check your name, 10-digit phone and fee.";return;}
try{const res=await fetch("/.netlify/functions/create-payment-order",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({name,phone,service,amount})});const data=await res.json();if(!res.ok)throw new Error(data.error||"Order creation failed. Payment setup may be incomplete.");if(typeof Razorpay==="undefined")throw new Error("Payment checkout could not load. Please retry.");const options={key:data.key_id,amount:data.amount,currency:"INR",name:"SAGAR CSC",description:service,order_id:data.razorpay_order_id,prefill:{name,contact:phone},theme:{color:"#245bd1"},handler:async response=>{statusEl.textContent="Verifying payment…";try{const vr=await fetch("/.netlify/functions/verify-payment",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({...response,order_ref:data.order_ref})});const out=await vr.json();if(!vr.ok||!out.verified)throw new Error(out.error||"Verification failed");statusEl.textContent="Payment verified! Order reference: "+out.order_ref;statusEl.className="status success";form.reset();}catch(err){statusEl.textContent="Verification pending. Keep payment ID "+response.razorpay_payment_id+" and contact SAGAR CSC.";statusEl.className="status error";}},modal:{ondismiss:()=>{statusEl.textContent="Payment window closed. Payment is not confirmed.";}}};new Razorpay(options).open();}catch(err){statusEl.textContent=err.message;statusEl.className="status error";}});
function renderServices(){
grid.replaceChildren();select.replaceChildren();
const placeholder=document.createElement("option");placeholder.value="";placeholder.textContent="Choose service";select.append(placeholder);
services.forEach((s,i)=>{
const card=document.createElement("article");card.className="service";
const h=document.createElement("h3");h.textContent=s.name;
const p=document.createElement("p");p.textContent=s.description||"";
const fee=document.createElement("p");fee.className="muted";fee.textContent="Fee confirmed before payment";
const btn=document.createElement("button");btn.type="button";btn.textContent="Request service";btn.addEventListener("click",()=>{select.value=s.name;go("order")});
card.append(h,p,fee,btn);grid.append(card);
const op=document.createElement("option");op.value=s.name;op.textContent=s.name;select.append(op);
});
renderAdmin();
}
function renderAdmin(){
const list=document.getElementById("admin-service-list");if(!list)return;list.replaceChildren();
services.forEach((s,i)=>{
const row=document.createElement("div");row.className="service";
const title=document.createElement("h3");title.textContent=s.name;
const desc=document.createElement("p");desc.textContent=s.description||"";
const edit=document.createElement("button");edit.textContent="Edit";edit.className="ghost";
edit.onclick=()=>{const nn=prompt("Service name:",s.name);if(nn===null)return;const dd=prompt("Description:",s.description||"");if(dd===null)return;if(!nn.trim())return alert("Name required");services[i]={name:nn.trim(),description:dd.trim()};saveServices();renderServices();};
const del=document.createElement("button");del.textContent="Delete";del.style.background="#b42318";
del.onclick=()=>{if(confirm("Delete "+s.name+"?")){services.splice(i,1);saveServices();renderServices();}};
row.append(title,desc,edit,del);list.append(row);
});
}
const adminForm=document.getElementById("service-admin-form");
if(adminForm)adminForm.addEventListener("submit",e=>{e.preventDefault();const name=adminForm.elements.serviceName.value.trim(),description=adminForm.elements.serviceDescription.value.trim();if(!name)return;services.push({name,description});saveServices();adminForm.reset();renderServices();alert("Service added!");});
renderServices();

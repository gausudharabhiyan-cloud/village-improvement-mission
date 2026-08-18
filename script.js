const form=document.getElementById("complaintForm");
const btn=document.getElementById("submitBtn");
const msg=document.getElementById("formMsg");
const modal=document.getElementById("modal");
const idText=document.getElementById("idText");

function localId(){
  const y=new Date().getFullYear();
  const key="vim_"+y;
  const n=(parseInt(localStorage.getItem(key)||"0",10)+1);
  localStorage.setItem(key,n);
  return `VIM-${y}-${String(n).padStart(4,"0")}`;
}
function showMessage(text,good=false){msg.textContent=text;msg.style.color=good?"#168148":"#b3261e"}
form.addEventListener("submit",async(e)=>{
  e.preventDefault();
  const data=Object.fromEntries(new FormData(form).entries());
  if(!/^[6-9]\d{9}$/.test(data.mobile)){showMessage("कृपया सही 10 अंकों का मोबाइल नंबर दर्ज करें।");return}
  const id=localId();
  data.complaintId=id;
  data.receivedAt=new Date().toISOString();
  data.status="Received";
  btn.disabled=true; btn.textContent="जमा हो रहा है...";
  try{
    if(typeof GOOGLE_SCRIPT_URL==="undefined" || !GOOGLE_SCRIPT_URL){
      throw new Error("Google Script URL not configured");
    }
    const body=new URLSearchParams(data);
    const response=await fetch(GOOGLE_SCRIPT_URL,{method:"POST",body});
    const result=await response.json().catch(()=>({ok:true}));
    if(result.ok===false) throw new Error(result.error||"Submission failed");
    form.reset();
    idText.textContent=`Complaint ID: ${id}`;
    modal.classList.add("show");
    modal.setAttribute("aria-hidden","false");
  }catch(err){
    console.error(err);
    showMessage("शिकायत भेजी नहीं जा सकी। कृपया कुछ देर बाद दोबारा प्रयास करें या Google Script URL सेट करें।");
  }finally{
    btn.disabled=false;btn.textContent="शिकायत जमा करें";
  }
});
function closeModal(){modal.classList.remove("show");modal.setAttribute("aria-hidden","true")}

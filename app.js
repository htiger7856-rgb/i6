const load=k=>JSON.parse(localStorage.getItem(k)||"[]");
const save=(k,v)=>localStorage.setItem(k,JSON.stringify(v));

function openPage(id,e){
document.querySelectorAll('.page').forEach(p=>p.style.display='none');
document.getElementById(id).style.display='block';
document.querySelectorAll('.tab button').forEach(b=>b.classList.remove('active'));
if(e) e.target.classList.add('active');

if(id==='products') renderProducts();
if(id==='invoice'){ renderInvoiceSearch();renderInvoice();}
if(id==='history') renderHistory();
}

function renderProducts(){
let q=document.getElementById('productSearch').value.toLowerCase();
let list=load('products');
let box=document.getElementById('productList'); 
box.innerHTML='';

list.filter(p=>p.name.toLowerCase().includes(q)).forEach(p=>{
box.innerHTML+=`
<div class='list-item'>
<b>${p.name}</b> - PKR ${p.rate}
<button onclick="deleteProduct(${p.id})" class='danger-btn'>Delete</button>
</div>`;
});
}

function addProduct(){
let name=document.getElementById('pName').value.trim();
let rate=Number(document.getElementById('pRate').value);
if(!name||!rate) return alert('Enter valid details');

let list=load('products');
list.push({id:Date.now(),name,rate});
save('products',list);
renderProducts();
}

function deleteProduct(id){
save('products',load('products').filter(p=>p.id!==id));
renderProducts();
}

function calculateLine(i){
let gross=i.rate*i.quantity;
let discAmount=(gross*(i.discount||0))/100;
let sub=gross-discAmount;
let taxAmount=(sub*(i.tax||0))/100;
return sub+taxAmount;
}

function renderInvoiceSearch(){
let q=document.getElementById('invoiceSearch').value.toLowerCase();
let list=load('products');
let box=document.getElementById('invoiceSearchList'); 
box.innerHTML='';

list.filter(p=>p.name.toLowerCase().includes(q)).forEach(p=>{
box.innerHTML+=`
<div class='list-item'>
<b>${p.name}</b> PKR ${p.rate}
<button onclick="addToInvoice(${p.id})">Add</button>
</div>`;
});
}

function addToInvoice(id){
let p=load('products').find(x=>x.id===id);
let inv=load('invoice');

inv.push({
id:Date.now(),
name:p.name,
rate:p.rate,
quantity:1,
discount:0,
tax:0
});

save('invoice',inv);
renderInvoice();
}

function renderInvoice(){
let list=load('invoice');
let box=document.getElementById('invoiceList'); 
box.innerHTML='';
let total=0;

list.forEach(i=>{
let fin=calculateLine(i);
total+=fin;

box.innerHTML+=`
<div class='list-item'>
<b>${i.name}</b><br>
Qty <input type='number' value='${i.quantity}' onchange='updateQty(${i.id},this.value)' style='width:70px'>
Disc% <input type='number' value='${i.discount}' onchange='updateDisc(${i.id},this.value)' style='width:70px'>
Tax% <input type='number' value='${i.tax}' onchange='updateTax(${i.id},this.value)' style='width:70px'>
<br><b>Line Total: PKR ${fin.toFixed(2)}</b>
<button onclick="removeItem(${i.id})" class='danger-btn'>Remove</button>
</div>`;
});

document.getElementById('totalAmount').innerText=total.toFixed(2);
}

function updateQty(id,v){let x=load('invoice');let i=x.find(e=>e.id===id);i.quantity=Number(v)||0;save('invoice',x);renderInvoice();}
function updateDisc(id,v){let x=load('invoice');let i=x.find(e=>e.id===id);i.discount=Number(v)||0;save('invoice',x);renderInvoice();}
function updateTax(id,v){let x=load('invoice');let i=x.find(e=>e.id===id);i.tax=Number(v)||0;save('invoice',x);renderInvoice();}
function removeItem(id){save('invoice',load('invoice').filter(i=>i.id!==id));renderInvoice();}
function clearInvoice(){save('invoice',[]);renderInvoice();}

function renderHistory(){
let h=load('invoice_history').reverse();
let box=document.getElementById('historyList'); 
box.innerHTML='';
h.forEach(e=>{
box.innerHTML+=`<div class='list-item'><b>${e.customer}</b><br>${e.date}<br>Total: PKR ${e.total}</div>`;
});
}

function clearHistory(){save('invoice_history',[]);renderHistory();}

async function generatePDF(){
const {jsPDF}=window.jspdf;
const doc=new jsPDF();
let y=14;

doc.setFont("Helvetica","bold");
doc.setFontSize(22);
doc.text("MAsad Billing",105,y,{align:"center"});
y+=12;

doc.setFont("Helvetica","normal");
doc.setFontSize(12);
let name=document.getElementById('invoiceName').value||'Unknown';
doc.text("Customer: "+name,10,y); y+=8;
doc.text("Date: "+new Date().toLocaleString(),10,y); y+=12;

let list=load('invoice');
let sum=0;

list.forEach(i=>{
let fin=calculateLine(i);
sum+=fin;

doc.text(i.name,10,y); y+=6;
doc.text(`Qty:${i.quantity} Rate:${i.rate} Disc:${i.discount}% Tax:${i.tax}%`,12,y); y+=6;
doc.text(`Line Total: PKR ${fin.toFixed(2)}`,12,y); y+=10;
});

doc.text("Grand Total: PKR "+sum.toFixed(2),105,y,{align:"center"});
doc.save("invoice.pdf");

let h=load('invoice_history');
h.push({id:Date.now(),customer:name,total:sum,date:new Date().toLocaleString(),items:list});
save('invoice_history',h);
}

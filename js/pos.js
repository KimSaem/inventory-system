let MENU = [];
let FILTERED = [];
let CART = [];

async function loadMenu(){

  const res =
    await fetch("/api/pos-menu");

  const json =
    await res.json();

  MENU =
    json.data || [];

  FILTERED = MENU;

  renderMenu(FILTERED);
}

function renderMenu(items){

  document.getElementById("menuGrid")
    .innerHTML =

    items.map(i=>`

      <div
        class="menu-item"
        onclick="addToCart(${i.id})"
      >

        <div class="name">
          ${i.name}
        </div>

        <div class="category">
          ${i.category}
        </div>

        <div class="price">
          $${Number(i.price).toFixed(2)}
        </div>

      </div>

    `).join("");
}

function filterMenu(category){

  if(category === "ALL"){

    FILTERED = MENU;

  }else{

    FILTERED =
      MENU.filter(i =>
        i.category === category
      );
  }

  renderMenu(FILTERED);
}

function addToCart(id){

  const item =
    MENU.find(i => i.id === id);

  if(!item) return;

  const existing =
    CART.find(i => i.id === id);

  if(existing){

    existing.qty++;

  }else{

    CART.push({
      id:item.id,
      name:item.name,
      price:item.price,
      qty:1
    });
  }

  renderCart();
}

function renderCart(){

  document.getElementById("cart")
    .innerHTML =

    CART.map(i=>`

      <div class="cart-item">

        <div>

          <div class="cart-name">
            ${i.name}
          </div>

          <div>
            $${i.price}
          </div>

        </div>

        <div>

          <button onclick="minus(${i.id})">-</button>

          ${i.qty}

          <button onclick="plus(${i.id})">+</button>

        </div>

      </div>

    `).join("");

  updateSummary();
}

function plus(id){

  const item =
    CART.find(i => i.id === id);

  if(item) item.qty++;

  renderCart();
}

function minus(id){

  const item =
    CART.find(i => i.id === id);

  if(!item) return;

  item.qty--;

  if(item.qty <= 0){

    CART =
      CART.filter(i => i.id !== id);
  }

  renderCart();
}

function clearCart(){

  CART = [];

  renderCart();
}

function updateSummary(){

  const items =
    CART.reduce((a,b)=>a+b.qty,0);

  const total =
    CART.reduce(
      (a,b)=>
        a + (b.qty * b.price)
    ,0);

  document.getElementById("itemCount")
    .innerText = items;

  document.getElementById("totalPrice")
    .innerText =
      "$" + total.toFixed(2);
}

async function checkout(){

  if(CART.length === 0){

    alert("EMPTY");

    return;
  }

  const res =
    await fetch("/api/sales",{

      method:"POST",

      headers:{
        "Content-Type":"application/json"
      },

      body:JSON.stringify({
        items:CART
      })

    });

  const json =
    await res.json();

  if(!json.success){

    alert(json.error);

    return;
  }

  alert(
    "PAYMENT SUCCESS\n\n" +
    "$" +
    Number(
      json.data.total_amount
    ).toFixed(2)
  );

  CART = [];

  renderCart();
}

async function createMenu(){

  const body = {

    name:
      document.getElementById("name").value,

    category:
      document.getElementById("category").value,

    price:Number(
      document.getElementById("price").value
    )

  };

  const res =
    await fetch("/api/pos-menu",{

      method:"POST",

      headers:{
        "Content-Type":"application/json"
      },

      body:JSON.stringify(body)

    });

  const json =
    await res.json();

  if(!json.success){

    alert("ERROR");

    return;
  }

  loadMenu();
}

document
  .getElementById("search")
  .addEventListener("input",(e)=>{

    const k =
      e.target.value.toLowerCase();

    renderMenu(

      FILTERED.filter(i =>

        i.name
          .toLowerCase()
          .includes(k)

      )

    );
  });

loadMenu();

setInterval(loadMenu,5000);

console.log("JS Running ✅");

/* LOGIN */
function login() {
  const u = document.getElementById("username").value;
  const p = document.getElementById("password").value;

  if (u === "admin" && p === "1234") {
    document.getElementById("loginBox").style.display = "none";
    document.getElementById("dashboard").style.display = "block";
    loadProducts();
  } else {
    alert("Wrong login ❌");
  }
}

/* IMAGE FUNCTION */
function getImage(name) {
  if (!name) return "images/default.jpg";

  name = name.toLowerCase();

  if (name.includes("burger")) return "images/burger.jpg";
  if (name.includes("noodles")) return "images/noodles.jpg";
  if (name.includes("pasta")) return "images/pasta.jpg";
  if (name.includes("pizza")) return "images/pizza.jpg";
  if (name.includes("sandwhich")) return "images/sandwhich.jpg";

  return "images/default.jpg";
}

/* LOAD PRODUCTS (FILTER FIX) */
async function loadProducts() {
  try {
    const res = await fetch("http://localhost:5000/products");
    const data = await res.json();

    let html = "";

    data.forEach(p => {

      // FILTER bad data
      if (!p.name || !p.price) return;

      html += `
        <div class="card">
          <img src="${getImage(p.name)}" />
          <h3>${p.name}</h3>
          <p>Price: ${p.price}</p>
          <p>Stock: ${p.quantity}</p>
          <button>Add</button>
        </div>
      `;
    });

    document.getElementById("products").innerHTML = html;

  } catch (err) {
    console.error(err);
    alert("Backend error ❌");
  }
}

/* TOGGLE FORM */
function toggleAddMenu() {
  const form = document.getElementById("addMenuForm");

  if (form.style.display === "none") {
    form.style.display = "block";
  } else {
    form.style.display = "none";
  }
}

/* ADD PRODUCT */
async function addProduct() {
  const name = document.getElementById("pname").value;
  const price = document.getElementById("pprice").value;
  const qty = document.getElementById("pqty").value;

  await fetch("http://localhost:5000/product", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      name,
      price,
      quantity: qty
    })
  });

  alert("Product Added ✔");

  loadProducts();
}
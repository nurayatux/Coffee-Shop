const menuEl = document.getElementById("menu");
const authDot = document.getElementById("authDot");
const authText = document.getElementById("authText");

function toggleMenu() {
    const panel = document.getElementById("menuPanel");
    const btn = document.getElementById("menuToggleBtn");

    panel.classList.toggle("open");

    const isOpen = panel.classList.contains("open");
    btn.textContent = isOpen ? "Hide" : "Show";
}

function setStatus(msg) {
    if (typeof msg === "string") {
        console.log(msg);
        alert(msg);
    } else {
        console.log(msg);
        alert(JSON.stringify(msg, null, 2));
    }
}

function getToken() {
    return localStorage.getItem("token");
}

function setAuthUI() {
    const token = localStorage.getItem("token");
    const username = localStorage.getItem("username");

    if (token && username) {
        authDot.classList.add("ok");
        authText.textContent = username;
    } else {
        authDot.classList.remove("ok");
        authText.textContent = "Guest";
    }
}

function toggleAccount() {
    const panel = document.getElementById("accountPanel");
    if (panel.style.display === "none" || panel.style.display === "") {
        if (!getToken()) return setStatus("❌ Please login first to open Account.");
        panel.style.display = "block";
        loadProfile();
        loadOrdersManage();
    } else {
        panel.style.display = "none";
    }
}

function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    setAuthUI();
    setStatus("Logged out");
}


async function api(path, method = "GET", body = null, auth = false) {
    const headers = { "Content-Type": "application/json" };
    if (auth) headers.Authorization = "Bearer " + getToken();

    const res = await fetch(path, {
        method,
        headers,
        body: body ? JSON.stringify(body) : null
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw data;
    return data;
}

async function register() {
    try {
        const usernameInput = document.getElementById("r_username");
        const emailInput = document.getElementById("r_email");
        const passwordInput = document.getElementById("r_password");

        const username = usernameInput.value.trim();
        const email = emailInput.value.trim();
        const password = passwordInput.value;

        const data = await api("/api/auth/register", "POST", {
        username,
        email,
        password
        });

        localStorage.setItem("token", data.token);
        localStorage.setItem("username", data.user.username);
        setAuthUI();

        document.getElementById("authPanel").classList.remove("open");

        usernameInput.value = "";
        emailInput.value = "";
        passwordInput.value = "";

    } catch (err) {
        setStatus(err);
    }
}

async function login() {
    try {
        const emailInput = document.getElementById("l_email");
        const passwordInput = document.getElementById("l_password");

        const email = emailInput.value.trim();
        const password = passwordInput.value;

        const data = await api("/api/auth/login", "POST", { email, password });

        localStorage.setItem("token", data.token);
        localStorage.setItem("username", data.user.username);
        setAuthUI();

        document.getElementById("authPanel").classList.remove("open");

        emailInput.value = "";
        passwordInput.value = "";

    } catch (err) {
        setStatus(err);
    }
}

function renderMenu(products) {
    if (!products || products.length === 0) {
        menuEl.innerHTML = `<div class="hint">No products found.</div>`;
        return;
    }

    menuEl.innerHTML = products
        .map(p => `
        <div class="menu-item" onclick="prefillOrder('${p._id}')">
            <div>
            <div class="menu-name">${escapeHtml(p.name)}</div>
            <div class="menu-desc">${escapeHtml(p.description || "")}</div>
            <div class="menu-meta">${escapeHtml(p.category || "Coffee")} • ID: ${p._id}</div>
            </div>
            <div class="price">${p.price} ₸</div>
        </div>
        `)
        .join("");
}

function prefillOrder(id) {
    document.getElementById("o_productId").value = id;
    setStatus("Product selected. Now choose qty and click Place order.");
}

async function loadMenu() {
    try {
        const data = await api("/api/orders/menu");
        renderMenu(data.products);

        document.getElementById("menuPanel").classList.add("open");
        document.getElementById("menuToggleBtn").textContent = "Hide";

    } catch (err) {
        setStatus(err);
    }
}

async function createOrder() {
    try {
        const productInput = document.getElementById("o_productId");
        const qtyInput = document.getElementById("o_qty");

        const productId = productInput.value.trim();
        const qty = Number(qtyInput.value || 1);

        if (!productId) return setStatus("Choose a product from the menu.");
        if (!getToken()) return setStatus("Please login first.");

        const data = await api(
        "/api/orders",
        "POST",
        { items: [{ productId, qty }] },
        true
        );

        productInput.value = "";
        qtyInput.value = 1;

        await loadOrdersManage();

    } catch (err) {
        setStatus(err);
    }
}

function escapeHtml(str) {
    return String(str)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

function toggleAuth() {
  const panel = document.getElementById("authPanel");
  if (!panel) return alert("authPanel not found in HTML");
  panel.classList.toggle("open");
}

async function loadProfile() {
    try {
        if (!getToken()) return setStatus("Please login first.");
        const data = await api("/api/users/profile", "GET", null, true);

        const u = data.user;
        document.getElementById("profileBox").innerHTML = `
        <div><b>Username:</b> ${escapeHtml(u.username)}</div>
        <div><b>Email:</b> ${escapeHtml(u.email)}</div>
        <div class="hint">User ID: ${u._id}</div>
        `;

        localStorage.setItem("username", u.username);
        setAuthUI();

    } catch (err) {
        setStatus(err);
    }
}

async function updateProfile() {
    try {
        if (!getToken()) return setStatus("Please login first.");

        const username = document.getElementById("u_username").value.trim();
        const password = document.getElementById("u_password").value;

        const body = {};
        if (username) body.username = username;
        if (password) body.password = password;

        if (Object.keys(body).length === 0) {
        return setStatus("Nothing to update (fill username or password).");
        }

        const data = await api("/api/users/profile", "PUT", body, true);

        document.getElementById("u_username").value = "";
        document.getElementById("u_password").value = "";

        await loadProfile();

    } catch (err) {
        setStatus(err);
    }
}

async function loadOrdersManage() {
    try {
        if (!getToken()) return setStatus("Please login first.");

        const data = await api("/api/orders", "GET", null, true);
        const orders = data.orders || [];

        const box = document.getElementById("ordersManage");

        if (orders.length === 0) {
        box.innerHTML = `<div class="hint">No orders yet.</div>`;
        return setStatus("Orders loaded (0)");
        }

        box.innerHTML = orders.map(o => `
        <div class="order-item">
            <div style="display:flex; justify-content:space-between; gap:10px; align-items:center;">
            <span class="badge ${o.status}">${o.status}</span>
            <div style="font-weight:900;">${o.totalPrice} ₸</div>
            </div>

            <div class="hint" style="margin-top:6px;">Order ID: ${o._id}</div>
            <div style="margin-top:8px; font-size:13px;">
            ${o.items.map(i => `${escapeHtml(i.name)} × <b>${i.qty}</b>`).join(", ")}
            </div>

            <div class="order-actions">
            <button class="btn btn-ghost" onclick="viewOrder('${o._id}')">View</button>

            <select class="select" id="st_${o._id}">
                <option value="new" ${o.status==="new"?"selected":""}>new</option>
                <option value="preparing" ${o.status==="preparing"?"selected":""}>preparing</option>
                <option value="ready" ${o.status==="ready"?"selected":""}>ready</option>
                <option value="delivered" ${o.status==="delivered"?"selected":""}>delivered</option>
            </select>

            <button class="btn btn-secondary" onclick="updateOrderStatus('${o._id}')">Update</button>
            <button class="btn btn-primary" onclick="deleteOrder('${o._id}')">Delete</button>
            </div>
        </div>
        `).join("");

    } catch (err) {
        setStatus(err);
    }
}

async function viewOrder(id) {
    try {
        const data = await api(`/api/orders/${id}`, "GET", null, true);
        setStatus(data);
    } catch (err) {
        setStatus(err);
    }
}

async function updateOrderStatus(id) {
    try {
        const status = document.getElementById(`st_${id}`).value;
        const data = await api(`/api/orders/${id}`, "PUT", { status }, true);
        setStatus("Order status updated");
        await loadOrdersManage();
    } catch (err) {
        setStatus(err);
    }
}

async function deleteOrder(id) {
    try {
        const ok = confirm("Delete this order?");
        if (!ok) return;

        await api(`/api/orders/${id}`, "DELETE", null, true);
        setStatus("Order deleted");
        await loadOrdersManage();
    } catch (err) {
        setStatus(err);
    }
}

setAuthUI();
loadMenu();

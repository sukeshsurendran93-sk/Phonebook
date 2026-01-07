const $ = (id) => document.getElementById(id);

const addBtn = $("addBtn");
const modal = $("modal");
const mTitle = $("modalTitle");
const saveBtn = $("saveBtn");
const form = $("contactForm");
let contacts = [];

let closeModal = () => modal.classList.remove("open");

document.querySelector(".close-btn").addEventListener("click", closeModal);

let openAddModal = () => {
  mTitle.textContent = "Add Contact";
  saveBtn.textContent = "Save";
  form.reset();
  $("name").focus();
  $("editId").value = "";
  modal.classList.add("open");
};

function renderContacts(searchTerm = "") {
  contactsGrid.innerHTML = "";
  const lowerTerm = searchTerm.toLowerCase().trim();

  const filtered = contacts.filter(
    (contact) =>
      contact.name.toLowerCase().includes(lowerTerm) ||
      contact.phone.includes(lowerTerm)
  );

  contactCount.textContent = filtered.length;

  if (filtered.length === 0) {
    contactsGrid.innerHTML = `
            <div class="no-contacts">
                ${
                  searchTerm
                    ? "No contacts found matching your search."
                    : "No contacts yet. Add one to get started!"
                }
            </div>`;
    return;
  }

  filtered.forEach((contact) => {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
            <div>
                <h4>${escapeHtml(contact.name)}</h4>
                <p>📱 ${escapeHtml(contact.phone)}</p>
                <p>✉️ ${escapeHtml(contact.email)}</p>
            </div>
            <div class="actions">
                <button class="edit-btn" onclick="openEditModal(${
                  contact.id
                })">Edit</button>
                <button class="delete-btn" onclick="deleteContact(${
                  contact.id
                })">Delete</button>
            </div>
        `;
    contactsGrid.appendChild(card);
  });
}

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const id = $("editId").value.trim();
  const name = $("name").value.trim();
  const phone = $("phone").value.trim();
  const email = $("email").value.trim();

  if (!name || !phone) {
    return alert("Name and phone number are required.");
  }
  if (name.length < 3) {
    return alert("Enter a valid name (≥3 chars).");
  }
  if (!/^\d{10}$/.test(phone)) {
    return alert("Phone number must be exactly 10 digits.");
  }
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return alert("Email is not valid.");
  }

  const isDuplicate = contacts.some(
    (contact) => contact.phone === phone && contact.id !== Number(id)
  );

  if (isDuplicate) {
    return alert("This phone number already exists in the phonebook!");
  }

  let contact = { id: id || Date.now(), name, phone, email };
  if (id) {
    const index = contacts.findIndex((c) => c.id == id);
    if (index !== -1) {
      contacts[index] = contact;
    }
    alert("Contact updated successfully!");
  } else {
    contacts.push(contact);
    alert("Contact added successfully!");
  }
  form.reset();
  closeModal();
  renderContacts($("searchInput").value);
});

const loadData = async () => {
  try {
    const res = await fetch("contacts.json");
    if (!res.ok) throw new Error(res.status);
    contacts = await res.json();
    renderContacts();
  } catch (e) {
    console.error(e);
    contacts = [];
    contactsGrid.innerHTML = `
      <div class="no-contacts">
        Could not load contacts. Please check your network or file path.
      </div>`;
  }
};

$("searchInput").addEventListener("input", () => {
  renderContacts($("searchInput").value.trim());
});

let openEditModal = (id) => {
  const contact = contacts.find((c) => c.id === id);
  if (!contact) return;

  mTitle.textContent = "Edit Contact";
  saveBtn.textContent = "Update";

  $("editId").value = id;
  $("name").value = contact.name;
  $("phone").value = contact.phone;
  $("email").value = contact.email;

  modal.classList.add("open");
};

let deleteContact = (id) => {
  if (!confirm("Delete this contact permanently?")) return;
  contacts = contacts.filter((c) => c.id != id);
  renderContacts($("searchInput").value);
};

loadData();

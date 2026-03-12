// Simple in-browser library management using localStorage
// Data model keys
const STORAGE_KEYS = {
  books: "library_lab_books",
  members: "library_lab_members",
  loans: "library_lab_loans",
};

// ---------- Utilities ----------
function load(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function save(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function generateId(prefix) {
  return `${prefix}_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
}

function ensureSeedData() {
  const books = load(STORAGE_KEYS.books);
  const members = load(STORAGE_KEYS.members);
  if (books.length || members.length) return;

  const seededBooks = [
    {
      id: generateId("book"),
      title: "Clean Code",
      author: "Robert C. Martin",
      isbn: "9780132350884",
    },
    {
      id: generateId("book"),
      title: "The Pragmatic Programmer",
      author: "Andrew Hunt, David Thomas",
      isbn: "9780201616224",
    },
    {
      id: generateId("book"),
      title: "Designing Data-Intensive Applications",
      author: "Martin Kleppmann",
      isbn: "9781449373320",
    },
  ];

  const seededMembers = [
    {
      id: generateId("member"),
      name: "Alice Johnson",
      email: "alice@example.com",
    },
    {
      id: generateId("member"),
      name: "DevOps Bot",
      email: "ci-cd@example.com",
    },
  ];

  save(STORAGE_KEYS.books, seededBooks);
  save(STORAGE_KEYS.members, seededMembers);
  save(STORAGE_KEYS.loans, []);
}

function resetData() {
  localStorage.removeItem(STORAGE_KEYS.books);
  localStorage.removeItem(STORAGE_KEYS.members);
  localStorage.removeItem(STORAGE_KEYS.loans);
  ensureSeedData();
  renderAll();
}

// ---------- Rendering ----------
function getData() {
  return {
    books: load(STORAGE_KEYS.books),
    members: load(STORAGE_KEYS.members),
    loans: load(STORAGE_KEYS.loans),
  };
}

function renderBooks(filterText) {
  const { books, loans } = getData();
  const body = document.getElementById("books-table-body");
  body.innerHTML = "";

  const text = (filterText || "").toLowerCase();
  const loanedBookIds = new Set(
    loans.filter((l) => l.status === "active").map((l) => l.bookId)
  );

  books
    .filter((b) => {
      if (!text) return true;
      return (
        b.title.toLowerCase().includes(text) ||
        b.author.toLowerCase().includes(text) ||
        b.isbn.toLowerCase().includes(text)
      );
    })
    .forEach((book) => {
      const tr = document.createElement("tr");
      const isLoaned = loanedBookIds.has(book.id);

      tr.innerHTML = `
        <td>${book.title}</td>
        <td>${book.author}</td>
        <td>${book.isbn}</td>
        <td>
          <span class="status-pill ${
            isLoaned ? "status-loaned" : "status-available"
          }">
            ${isLoaned ? "On loan" : "Available"}
          </span>
        </td>
        <td>
          <div class="actions">
            <button class="btn icon" data-edit-book="${book.id}">Edit</button>
            <button class="btn icon danger" data-delete-book="${
              book.id
            }">Delete</button>
          </div>
        </td>
      `;
      body.appendChild(tr);
    });
}

function renderMembers(filterText) {
  const { members } = getData();
  const body = document.getElementById("members-table-body");
  body.innerHTML = "";

  const text = (filterText || "").toLowerCase();

  members
    .filter((m) => {
      if (!text) return true;
      return (
        m.name.toLowerCase().includes(text) ||
        m.email.toLowerCase().includes(text)
      );
    })
    .forEach((member) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${member.name}</td>
        <td>${member.email}</td>
        <td><span class="tag">${member.id}</span></td>
        <td>
          <div class="actions">
            <button class="btn icon" data-edit-member="${member.id}">Edit</button>
            <button class="btn icon danger" data-delete-member="${
              member.id
            }">Delete</button>
          </div>
        </td>
      `;
      body.appendChild(tr);
    });
}

function renderLoans(filter) {
  const { books, members, loans } = getData();
  const body = document.getElementById("loans-table-body");
  body.innerHTML = "";

  const filterValue = filter || "all";
  const bookMap = new Map(books.map((b) => [b.id, b]));
  const memberMap = new Map(members.map((m) => [m.id, m]));

  loans
    .filter((loan) => {
      if (filterValue === "all") return true;
      return loan.status === filterValue;
    })
    .forEach((loan) => {
      const tr = document.createElement("tr");
      const book = bookMap.get(loan.bookId);
      const member = memberMap.get(loan.memberId);
      const label =
        loan.status === "active"
          ? "Active"
          : loan.status === "returned"
          ? "Returned"
          : "Unknown";
      const statusClass =
        loan.status === "returned" ? "status-returned" : "status-loaned";

      tr.innerHTML = `
        <td>${book ? book.title : "Unknown"}</td>
        <td>${member ? member.name : "Unknown"}</td>
        <td>${loan.loanDate}</td>
        <td>${loan.dueDate}</td>
        <td>
          <span class="status-pill ${statusClass}">${label}</span>
        </td>
        <td>
          <div class="actions">
            ${
              loan.status === "active"
                ? `<button class="btn icon" data-return-loan="${loan.id}">Mark Returned</button>`
                : ""
            }
            <button class="btn icon danger" data-delete-loan="${
              loan.id
            }">Delete</button>
          </div>
        </td>
      `;
      body.appendChild(tr);
    });
}

function renderAll() {
  renderBooks(document.getElementById("book-search").value);
  renderMembers(document.getElementById("member-search").value);
  renderLoans(document.getElementById("loan-filter").value);
}

// ---------- Modals ----------
const backdrop = document.getElementById("modal-backdrop");

function openModal(dialog) {
  backdrop.classList.remove("hidden");
  dialog.showModal();
}

function closeModal(dialog) {
  dialog.close();
  backdrop.classList.add("hidden");
}

// ---------- Event wiring ----------
document.addEventListener("DOMContentLoaded", () => {
  ensureSeedData();

  const navButtons = document.querySelectorAll(".nav-item");
  const views = {
    books: document.getElementById("view-books"),
    members: document.getElementById("view-members"),
    loans: document.getElementById("view-loans"),
  };
  const viewTitle = document.getElementById("view-title");

  navButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const target = btn.getAttribute("data-view");
      navButtons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      Object.keys(views).forEach((key) => {
        views[key].classList.toggle("hidden", key !== target);
      });
      viewTitle.textContent =
        target.charAt(0).toUpperCase() + target.slice(1).toLowerCase();
    });
  });

  // Books
  const bookModal = document.getElementById("book-modal");
  const bookForm = document.getElementById("book-form");
  const addBookBtn = document.getElementById("add-book-btn");
  const bookSearch = document.getElementById("book-search");

  addBookBtn.addEventListener("click", () => {
    document.getElementById("book-modal-title").textContent = "Add Book";
    bookForm.reset();
    document.getElementById("book-id").value = "";
    openModal(bookModal);
  });

  bookForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const id = document.getElementById("book-id").value;
    const title = document.getElementById("book-title").value.trim();
    const author = document.getElementById("book-author").value.trim();
    const isbn = document.getElementById("book-isbn").value.trim();

    if (!title || !author || !isbn) return;

    const books = load(STORAGE_KEYS.books);
    if (id) {
      const index = books.findIndex((b) => b.id === id);
      if (index !== -1) {
        books[index] = { ...books[index], title, author, isbn };
      }
    } else {
      books.push({
        id: generateId("book"),
        title,
        author,
        isbn,
      });
    }
    save(STORAGE_KEYS.books, books);
    closeModal(bookModal);
    renderBooks(bookSearch.value);
  });

  // Delegate book actions
  document
    .getElementById("books-table-body")
    .addEventListener("click", (event) => {
      const target = event.target;
      const editId = target.getAttribute("data-edit-book");
      const deleteId = target.getAttribute("data-delete-book");
      const books = load(STORAGE_KEYS.books);

      if (editId) {
        const book = books.find((b) => b.id === editId);
        if (!book) return;
        document.getElementById("book-modal-title").textContent = "Edit Book";
        document.getElementById("book-id").value = book.id;
        document.getElementById("book-title").value = book.title;
        document.getElementById("book-author").value = book.author;
        document.getElementById("book-isbn").value = book.isbn;
        openModal(bookModal);
      } else if (deleteId) {
        const confirmed = window.confirm(
          "Delete this book? Active loans for this book will remain but show 'Unknown' title."
        );
        if (!confirmed) return;
        const updated = books.filter((b) => b.id !== deleteId);
        save(STORAGE_KEYS.books, updated);
        renderBooks(bookSearch.value);
      }
    });

  // Members
  const memberModal = document.getElementById("member-modal");
  const memberForm = document.getElementById("member-form");
  const addMemberBtn = document.getElementById("add-member-btn");
  const memberSearch = document.getElementById("member-search");

  addMemberBtn.addEventListener("click", () => {
    document.getElementById("member-modal-title").textContent = "Add Member";
    memberForm.reset();
    document.getElementById("member-id").value = "";
    openModal(memberModal);
  });

  memberForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const id = document.getElementById("member-id").value;
    const name = document.getElementById("member-name").value.trim();
    const email = document.getElementById("member-email").value.trim();

    if (!name || !email) return;

    const members = load(STORAGE_KEYS.members);
    if (id) {
      const index = members.findIndex((m) => m.id === id);
      if (index !== -1) {
        members[index] = { ...members[index], name, email };
      }
    } else {
      members.push({
        id: generateId("member"),
        name,
        email,
      });
    }
    save(STORAGE_KEYS.members, members);
    closeModal(memberModal);
    renderMembers(memberSearch.value);
  });

  document
    .getElementById("members-table-body")
    .addEventListener("click", (event) => {
      const target = event.target;
      const editId = target.getAttribute("data-edit-member");
      const deleteId = target.getAttribute("data-delete-member");
      const members = load(STORAGE_KEYS.members);

      if (editId) {
        const member = members.find((m) => m.id === editId);
        if (!member) return;
        document.getElementById("member-modal-title").textContent =
          "Edit Member";
        document.getElementById("member-id").value = member.id;
        document.getElementById("member-name").value = member.name;
        document.getElementById("member-email").value = member.email;
        openModal(memberModal);
      } else if (deleteId) {
        const confirmed = window.confirm(
          "Delete this member? Existing loans will remain but show 'Unknown' member."
        );
        if (!confirmed) return;
        const updated = members.filter((m) => m.id !== deleteId);
        save(STORAGE_KEYS.members, updated);
        renderMembers(memberSearch.value);
      }
    });

  // Loans
  const loanModal = document.getElementById("loan-modal");
  const loanForm = document.getElementById("loan-form");
  const addLoanBtn = document.getElementById("add-loan-btn");
  const loanFilter = document.getElementById("loan-filter");

  function populateLoanSelectors() {
    const { books, members, loans } = getData();
    const activeBookIds = new Set(
      loans.filter((l) => l.status === "active").map((l) => l.bookId)
    );
    const bookSelect = document.getElementById("loan-book");
    const memberSelect = document.getElementById("loan-member");

    bookSelect.innerHTML = "";
    memberSelect.innerHTML = "";

    const availableBooks = books.filter((b) => !activeBookIds.has(b.id));
    availableBooks.forEach((book) => {
      const option = document.createElement("option");
      option.value = book.id;
      option.textContent = `${book.title} — ${book.author}`;
      bookSelect.appendChild(option);
    });

    members.forEach((member) => {
      const option = document.createElement("option");
      option.value = member.id;
      option.textContent = `${member.name} (${member.email})`;
      memberSelect.appendChild(option);
    });
  }

  addLoanBtn.addEventListener("click", () => {
    loanForm.reset();
    document.getElementById("loan-id").value = "";

    const today = new Date().toISOString().slice(0, 10);
    const inTwoWeeks = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
      .toISOString()
      .slice(0, 10);
    document.getElementById("loan-date").value = today;
    document.getElementById("loan-due-date").value = inTwoWeeks;

    populateLoanSelectors();
    openModal(loanModal);
  });

  loanForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const bookId = document.getElementById("loan-book").value;
    const memberId = document.getElementById("loan-member").value;
    const loanDate = document.getElementById("loan-date").value;
    const dueDate = document.getElementById("loan-due-date").value;

    if (!bookId || !memberId || !loanDate || !dueDate) return;

    const loans = load(STORAGE_KEYS.loans);
    loans.push({
      id: generateId("loan"),
      bookId,
      memberId,
      loanDate,
      dueDate,
      status: "active",
    });
    save(STORAGE_KEYS.loans, loans);
    closeModal(loanModal);
    renderLoans(loanFilter.value);
    renderBooks(bookSearch.value);
  });

  document
    .getElementById("loans-table-body")
    .addEventListener("click", (event) => {
      const target = event.target;
      const returnId = target.getAttribute("data-return-loan");
      const deleteId = target.getAttribute("data-delete-loan");
      const loans = load(STORAGE_KEYS.loans);

      if (returnId) {
        const index = loans.findIndex((l) => l.id === returnId);
        if (index !== -1) {
          loans[index] = { ...loans[index], status: "returned" };
          save(STORAGE_KEYS.loans, loans);
          renderLoans(loanFilter.value);
          renderBooks(bookSearch.value);
        }
      } else if (deleteId) {
        const confirmed = window.confirm("Delete this loan record?");
        if (!confirmed) return;
        const updated = loans.filter((l) => l.id !== deleteId);
        save(STORAGE_KEYS.loans, updated);
        renderLoans(loanFilter.value);
        renderBooks(bookSearch.value);
      }
    });

  // Common modal close buttons
  document.querySelectorAll("[data-close]").forEach((button) => {
    button.addEventListener("click", () => {
      const dialog = button.closest("dialog");
      if (dialog) {
        closeModal(dialog);
      }
    });
  });

  backdrop.addEventListener("click", () => {
    document.querySelectorAll("dialog[open]").forEach((dialog) => {
      closeModal(dialog);
    });
  });

  // Search + filters
  bookSearch.addEventListener("input", () => renderBooks(bookSearch.value));
  memberSearch.addEventListener("input", () =>
    renderMembers(memberSearch.value)
  );
  loanFilter.addEventListener("change", () => renderLoans(loanFilter.value));

  // Reset data
  document
    .getElementById("reset-data-btn")
    .addEventListener("click", () => resetData());

  // Initial render
  renderAll();
});


const API = "http://localhost:5000/api";


/* ================= LOGIN ================= */

async function login() {

    const username =
        document.getElementById("username").value;

    const password =
        document.getElementById("password").value;

    try {

        const response = await fetch(
            `${API}/login`,
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    username,
                    password
                })
            }
        );

        const data = await response.json();

        if (data.success) {

            document
                .getElementById("loginPage")
                .classList.add("hidden");

            document
                .getElementById("mainApp")
                .classList.remove("hidden");

            loadDashboard();
            loadBooks();
            loadMembers();

        } else {

            alert(data.message);

        }

    } catch (error) {

        alert(
            "Backend server is not running!"
        );

    }
}


/* ================= LOGOUT ================= */

function logout() {

    document
        .getElementById("mainApp")
        .classList.add("hidden");

    document
        .getElementById("loginPage")
        .classList.remove("hidden");
}


/* ================= NAVIGATION ================= */

function showSection(sectionName) {

    document
        .querySelectorAll(".section")
        .forEach(section => {
            section.classList.add("hidden");
        });

    document
        .getElementById(sectionName)
        .classList.remove("hidden");

    if (sectionName === "dashboard")
        loadDashboard();

    if (sectionName === "books")
        loadBooks();

    if (sectionName === "members")
        loadMembers();

    if (sectionName === "issue") {
        loadBooksForIssue();
        loadMembersForIssue();
    }

    if (sectionName === "return")
        loadTransactions();

    if (sectionName === "reports")
        loadReport();
}


/* ================= DASHBOARD ================= */

async function loadDashboard() {

    const response =
        await fetch(`${API}/dashboard`);

    const data =
        await response.json();

    document.getElementById("totalBooks")
        .innerText = data.totalBooks;

    document.getElementById("availableBooks")
        .innerText = data.availableBooks;

    document.getElementById("issuedBooks")
        .innerText = data.issuedBooks;

    document.getElementById("totalMembers")
        .innerText = data.totalMembers;

    document.getElementById("totalFine")
        .innerText = data.totalFine;
}


/* ================= BOOKS ================= */

let allBooks = [];

async function loadBooks() {

    const response =
        await fetch(`${API}/books`);

    allBooks =
        await response.json();

    displayBooks(allBooks);
}


function displayBooks(books) {

    const container =
        document.getElementById("bookList");

    container.innerHTML = "";

    books.forEach(book => {

        const status =
            book.available > 0
                ? "Available ✅"
                : "Not Available ❌";

        container.innerHTML += `

            <div class="book-card">

                <div class="book-icon">📚</div>

                <h3>${book.title}</h3>

                <p>✍️ ${book.author}</p>

                <br>

                <span class="category">
                    ${book.category}
                </span>

                <p class="available">
                    ${status}
                </p>

                <p>
                    ${book.available}
                    / ${book.quantity} available
                </p>

            </div>

        `;
    });
}


function searchBooks() {

    const value =
        document
        .getElementById("bookSearch")
        .value
        .toLowerCase();

    const filtered =
        allBooks.filter(book =>
            book.title.toLowerCase().includes(value) ||
            book.author.toLowerCase().includes(value) ||
            book.category.toLowerCase().includes(value)
        );

    displayBooks(filtered);
}


/* ================= ADD BOOK ================= */

function openBookForm() {

    document
        .getElementById("bookModal")
        .classList.remove("hidden");
}


function closeBookForm() {

    document
        .getElementById("bookModal")
        .classList.add("hidden");
}


async function addBook() {

    const title =
        document.getElementById("newTitle").value;

    const author =
        document.getElementById("newAuthor").value;

    const category =
        document.getElementById("newCategory").value;

    const quantity =
        document.getElementById("newQuantity").value;

    if (!title || !author || !category || !quantity) {

        alert("Please fill all fields");

        return;
    }

    await fetch(`${API}/books`, {

        method: "POST",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify({
            title,
            author,
            category,
            quantity
        })

    });

    alert("Book added successfully! 📚");

    closeBookForm();

    loadBooks();

    loadDashboard();
}


/* ================= MEMBERS ================= */

async function loadMembers() {

    const response =
        await fetch(`${API}/members`);

    const members =
        await response.json();

    const container =
        document.getElementById("memberList");

    container.innerHTML = "";

    members.forEach(member => {

        container.innerHTML += `

            <div class="member-card">

                <div class="member-avatar">
                    👤
                </div>

                <h3>${member.name}</h3>

                <p>📧 ${member.email}</p>

                <p>📱 ${member.phone}</p>

            </div>

        `;
    });
}


/* ================= ADD MEMBER ================= */

function openMemberForm() {

    document
        .getElementById("memberModal")
        .classList.remove("hidden");
}


function closeMemberForm() {

    document
        .getElementById("memberModal")
        .classList.add("hidden");
}


async function addMember() {

    const name =
        document.getElementById("memberName").value;

    const email =
        document.getElementById("memberEmail").value;

    const phone =
        document.getElementById("memberPhone").value;

    if (!name || !email || !phone) {

        alert("Please fill all fields");

        return;
    }

    await fetch(`${API}/members`, {

        method: "POST",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify({
            name,
            email,
            phone
        })

    });

    alert("Member added successfully! 👤");

    closeMemberForm();

    loadMembers();

    loadDashboard();
}


/* ================= ISSUE BOOK ================= */

async function loadBooksForIssue() {

    const response =
        await fetch(`${API}/books`);

    const books =
        await response.json();

    const select =
        document.getElementById("issueBook");

    select.innerHTML =
        `<option value="">Select Book</option>`;

    books
        .filter(book => book.available > 0)
        .forEach(book => {

            select.innerHTML += `
                <option value="${book.id}">
                    ${book.title}
                    (${book.available} available)
                </option>
            `;
        });
}


async function loadMembersForIssue() {

    const response =
        await fetch(`${API}/members`);

    const members =
        await response.json();

    const select =
        document.getElementById("issueMember");

    select.innerHTML =
        `<option value="">Select Member</option>`;

    members.forEach(member => {

        select.innerHTML += `
            <option value="${member.id}">
                ${member.name}
            </option>
        `;
    });
}


async function issueBook() {

    const bookId =
        document.getElementById("issueBook").value;

    const memberId =
        document.getElementById("issueMember").value;

    if (!bookId || !memberId) {

        alert("Please select book and member");

        return;
    }

    const response =
        await fetch(`${API}/issue`, {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                bookId,
                memberId
            })
        });

    const data =
        await response.json();

    if (response.ok) {

        alert(
            "Book issued successfully! 📖\n" +
            "Due Date: " +
            data.transaction.dueDate
        );

        loadDashboard();

        loadBooksForIssue();

    } else {

        alert(data.message);
    }
}


/* ================= RETURN ================= */

async function loadTransactions() {

    const response =
        await fetch(`${API}/transactions`);

    const transactions =
        await response.json();

    const container =
        document.getElementById("transactionList");

    container.innerHTML = "";

    const active =
        transactions.filter(
            t => t.status === "Issued"
        );

    if (active.length === 0) {

        container.innerHTML = `
            <div class="welcome">
                🎉 No books are currently issued.
            </div>
        `;

        return;
    }

    active.forEach(transaction => {

        container.innerHTML += `

            <div class="transaction">

                <div>

                    <h3>📖 ${transaction.bookTitle}</h3>

                    <p>
                        👤 ${transaction.memberName}
                    </p>

                    <p>
                        📅 Issue Date:
                        ${transaction.issueDate}
                    </p>

                    <p>
                        ⏰ Due Date:
                        ${transaction.dueDate}
                    </p>

                </div>

                <button
                    class="return-btn"
                    onclick="returnBook(${transaction.id})">

                    ↩️ Return

                </button>

            </div>

        `;
    });
}


async function returnBook(id) {

    const response =
        await fetch(`${API}/return`, {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                transactionId: id
            })
        });

    const data =
        await response.json();

    if (response.ok) {

        alert(
            "Book returned successfully! 📚\n" +
            "Fine: ₹" + data.fine
        );

        loadTransactions();

        loadDashboard();

    } else {

        alert(data.message);
    }
}


/* ================= REPORTS ================= */

async function loadReport() {

    const response =
        await fetch(`${API}/dashboard`);

    const data =
        await response.json();

    document.getElementById("reportData").innerHTML = `

        <div class="report-row">
            <strong>📚 Total Books</strong>
            <span>${data.totalBooks}</span>
        </div>

        <div class="report-row">
            <strong>✅ Available Books</strong>
            <span>${data.availableBooks}</span>
        </div>

        <div class="report-row">
            <strong>📖 Issued Books</strong>
            <span>${data.issuedBooks}</span>
        </div>

        <div class="report-row">
            <strong>👥 Total Members</strong>
            <span>${data.totalMembers}</span>
        </div>

        <div class="report-row">
            <strong>💰 Total Fine</strong>
            <span>₹${data.totalFine}</span>
        </div>

    `;
}
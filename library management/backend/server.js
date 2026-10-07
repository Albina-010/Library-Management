const express = require("express");
const cors = require("cors");
const fs = require("fs");

const app = express();

app.use(cors());
app.use(express.json());

const PORT = 5000;
const DATA_FILE = "./data.json";

function getData() {
    return JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
}

function saveData(data) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

/* ================= LOGIN ================= */

app.post("/api/login", (req, res) => {

    const { username, password } = req.body;

    if (username === "admin" && password === "admin123") {

        res.json({
            success: true,
            message: "Login successful",
            user: "Administrator"
        });

    } else {

        res.status(401).json({
            success: false,
            message: "Invalid username or password"
        });
    }
});

/* ================= BOOKS ================= */

app.get("/api/books", (req, res) => {

    const data = getData();

    res.json(data.books);
});


app.post("/api/books", (req, res) => {

    const data = getData();

    const newBook = {
        id: Date.now(),
        title: req.body.title,
        author: req.body.author,
        category: req.body.category,
        quantity: Number(req.body.quantity),
        available: Number(req.body.quantity)
    };

    data.books.push(newBook);

    saveData(data);

    res.json(newBook);
});


/* ================= MEMBERS ================= */

app.get("/api/members", (req, res) => {

    const data = getData();

    res.json(data.members);
});


app.post("/api/members", (req, res) => {

    const data = getData();

    const newMember = {
        id: Date.now(),
        name: req.body.name,
        email: req.body.email,
        phone: req.body.phone
    };

    data.members.push(newMember);

    saveData(data);

    res.json(newMember);
});


/* ================= ISSUE BOOK ================= */

app.post("/api/issue", (req, res) => {

    const data = getData();

    const { bookId, memberId } = req.body;

    const book = data.books.find(b => b.id == bookId);
    const member = data.members.find(m => m.id == memberId);

    if (!book) {
        return res.status(404).json({
            message: "Book not found"
        });
    }

    if (!member) {
        return res.status(404).json({
            message: "Member not found"
        });
    }

    if (book.available <= 0) {
        return res.status(400).json({
            message: "Book is currently unavailable"
        });
    }

    book.available--;

    const issueDate = new Date();

    const dueDate = new Date();
    dueDate.setDate(issueDate.getDate() + 14);

    const transaction = {
        id: Date.now(),
        bookId: book.id,
        bookTitle: book.title,
        memberId: member.id,
        memberName: member.name,
        issueDate: issueDate.toISOString().split("T")[0],
        dueDate: dueDate.toISOString().split("T")[0],
        returnDate: null,
        fine: 0,
        status: "Issued"
    };

    data.transactions.push(transaction);

    saveData(data);

    res.json({
        message: "Book issued successfully",
        transaction
    });
});


/* ================= RETURN BOOK ================= */

app.post("/api/return", (req, res) => {

    const data = getData();

    const { transactionId } = req.body;

    const transaction = data.transactions.find(
        t => t.id == transactionId && t.status === "Issued"
    );

    if (!transaction) {
        return res.status(404).json({
            message: "Active transaction not found"
        });
    }

    const book = data.books.find(
        b => b.id == transaction.bookId
    );

    const returnDate = new Date();

    const dueDate = new Date(transaction.dueDate);

    let fine = 0;

    if (returnDate > dueDate) {

        const difference =
            returnDate.getTime() - dueDate.getTime();

        const lateDays =
            Math.ceil(difference / (1000 * 60 * 60 * 24));

        fine = lateDays * 5;
    }

    transaction.returnDate =
        returnDate.toISOString().split("T")[0];

    transaction.fine = fine;

    transaction.status = "Returned";

    if (book) {
        book.available++;
    }

    saveData(data);

    res.json({
        message: "Book returned successfully",
        fine
    });
});


/* ================= TRANSACTIONS ================= */

app.get("/api/transactions", (req, res) => {

    const data = getData();

    res.json(data.transactions);
});


/* ================= DASHBOARD ================= */

app.get("/api/dashboard", (req, res) => {

    const data = getData();

    const totalBooks = data.books.reduce(
        (sum, book) => sum + book.quantity,
        0
    );

    const availableBooks = data.books.reduce(
        (sum, book) => sum + book.available,
        0
    );

    const issuedBooks = totalBooks - availableBooks;

    const totalMembers = data.members.length;

    const totalFine = data.transactions.reduce(
        (sum, transaction) => sum + transaction.fine,
        0
    );

    res.json({
        totalBooks,
        availableBooks,
        issuedBooks,
        totalMembers,
        totalFine
    });
});


app.listen(PORT, () => {

    console.log(
        `Library Backend running at http://localhost:${PORT}`
    );

});
# 📚 Bookshelf App

A simple web app to manage my personal bookshelf, built with Node.js, Express, EJS, and PostgreSQL.

---

## 🚀 Features

- View all books
- View books by an aurthor
- View books by Langage or category
- Search books by title or author (**Coming soon!**)

---

## 🛠 Tech Stack

- **Backend**: Node.js, Express
- **Templating**: EJS
- **Database**: PostgreSQL
- **Frontend**: HTML, CSS, vanilla JavaScript

---

## 📦 Setup Instructions

1. Clone the repo:
   ```bash
   git clone https://github.com/RanimRebai/bookshelf.git
   cd bookshelf

2. Install dependencies:
    ```bash
    npm install

3. Create your .env file (use .env.example as a guide):
    ```bash
    cp .env.example .env

4. Set up your databases:
    ```sql
    -- In PostgreSQL
    CREATE DATABASE books;
    CREATE DATABASE author;
5. Run the app:
    ```bash
    npm start


## 🧪 Environment Variables
add your credentials:
    ```env
    DATABASE_URL=postgresql://youruser:yourpassword@localhost:5432/bookshelf

## 🗂 Folder Structure
bookshelf/
├── public/           # Static files (CSS, JS)
├── views/            # EJS templates
├── .gitignore
├── index.js
├── package.json
└── README.md

## 📝 License
MIT License – free to use and modify.

## 🧠 Todo
 ✅ CRUD functionality

 ✅ PostgreSQL integration

 ⏳ Live search with fetch (in progress)





    

import express from "express";
import pg from "pg";
import bodyParser from "body-parser";
import axios from "axios";
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = 3000;

app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');


const db = new pg.Client({
    database: 'books',
    user: 'postgres',
    password: process.env.DB_PASSWORD,
    host: 'localhost',
    port: 5432
});
db.connect();

let allBooks = [];

(async () => {
    try {
        const result = await db.query("SELECT * FROM books");
        allBooks = result.rows;
    } catch (err) {
        console.error("Database connection failed:", err);
    }
})();

let topBooks = [];

(async () => {
    try {
        const result = await db.query("SELECT * FROM books ORDER BY review DESC");
        topBooks = result.rows;
    } catch (err) {
        console.error("Database connection failed:", err);
    }
})();


function QueryTitle(string) {
    return string.split(" ").join("+");
};



app.get("/", async (req, res) => {
    try {
        const results = [];
        const books = allBooks.slice(0,6);
        for (const book of books) {
            const query = QueryTitle(book.title);
            const url = `https://openlibrary.org/search.json?q=${query}`;
            const response = await axios.get(url);
            const firstResult = response.data.docs[0];
            const review = book.overview;
            let authorId = 0;
            const rate = book.review;
            let author ="";
            try {
                const result = await db.query(
                    "SELECT author.id , author.name FROM books JOIN author ON author.title = books.title WHERE books.title = $1;",
                    [book.title]
                );
                authorId = result.rows[0]?.id || 0;
                author = result.rows[0]?.name || null;
            } catch (err) {
                console.error("Database query failed:", err);
            }
            if (!firstResult) continue;
            
            results.push({
                title: book.title,
                id: firstResult.key,
                author: author,
                authorId : authorId,
                cover_i: firstResult.cover_i || null,
                review : review,
                rate: rate
            });
            console.log(authorId);
        }

        res.render('index', { books: results });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

app.get("/all", async (req, res) => {
    try {
        const results = [];
        
        for (const book of allBooks) {
            const query = QueryTitle(book.title);
            const url = `https://openlibrary.org/search.json?q=${query}`;
            const response = await axios.get(url);
            const firstResult = response.data.docs[0];
            const review = book.overview;
            const rate = book.review;
            let authorId = 0;
            let author="";
            try {
                const result = await db.query(
                    "SELECT author.id, author.name FROM books JOIN author ON author.title = books.title WHERE books.title = $1;",
                    [book.title]
                );
                authorId = result.rows[0]?.id || 0;
                author = result.rows[0]?.name || null;
            } catch (err) {
                console.error("Database query failed:", err);
            }
            if (!firstResult) continue;
            
            results.push({
                title: book.title,
                id: firstResult.key,
                author: author,
                authorId : authorId,
                cover_i: firstResult.cover_i || null,
                review : review,
                rate : rate
            });
            console.log(authorId);
        }

        res.render('allIndex', { books: results });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal Server Error" });
    }
});


app.get("/author", async (req, res) => {
    const authorId = req.query.id;

    if (!authorId) {
        return res.status(400).send("Missing author ID");
    }

    try {
        // First, fetch the author's name
        const authorResult = await db.query(
            "SELECT name FROM author WHERE id = $1;",
            [authorId]
        );

        if (authorResult.rows.length === 0) {
            return res.status(404).send("Author not found");
        }

        const authorName = authorResult.rows[0].name;

        // Now, fetch all books by that author (join on title)
        const dbResult = await db.query(
            `SELECT books.title, books.review, books.overview 
             FROM books 
             JOIN author ON author.title = books.title 
             WHERE author.name LIKE '%' || $1 || '%';`,
            [authorName]
        );

        const authorBooks = [];

        for (const book of dbResult.rows) {
            const query = QueryTitle(book.title);
            const url = `https://openlibrary.org/search.json?q=${query}`;

            let openLibData;
            try {
                const olResponse = await axios.get(url);
                openLibData = olResponse.data.docs[0];
            } catch (err) {
                console.error(`OpenLibrary fetch failed for "${book.title}"`, err);
                openLibData = null;
            }

            authorBooks.push({
                title: book.title,
                id: openLibData?.key || null,
                author: authorName,
                authorId: authorId,
                cover_i: openLibData?.cover_i || null,
                review: book.overview,
                rate: book.review
            });
        }

        res.render("author", { books: authorBooks });

    } catch (err) {
        console.error("Query error:", err);
        res.status(500).send("Internal server error");
    }
});
app.get("/language",async(req,res)=>{
    const language = req.query.lang;
    const results =[];
    try{
        const books = await db.query( `SELECT books.title, books.review, books.overview , author.name 
             FROM books 
             JOIN author ON author.title = books.title 
             WHERE books.language = $1;`,
            [language]);
        for(const book of books.rows){
            const query = QueryTitle(book.title);
            const url = `https://openlibrary.org/search.json?q=${query}`;
            const response = await axios.get(url);
            const firstResult = response.data.docs[0];
            const review = book.overview;
            const rate = book.review;
            let authorId = 0;
            let author ="";
            console.log(book.title)
            try {
                const result = await db.query(
                    "SELECT author.id , author.name FROM books JOIN author ON author.title = books.title WHERE books.title = $1;",
                    [book.title]
                );
                authorId = result.rows[0]?.id || 0;
                author = result.rows[0]?.name || null;
            } catch (err) {
                console.error("Database query failed:", err);
            }
            if (!firstResult) continue;
            
            results.push({
                title: book.title,
                id: firstResult.key,
                author: author,
                authorId : authorId,
                cover_i: firstResult.cover_i || null,
                review : review,
                rate:rate
            });
            console.log(authorId);
        }

        res.render('author', { books: results });

        
    }catch(err){
        console.log('type error: ',err);
    }
});

app.get("/category",async(req,res)=>{
    const category = req.query.category;
    const results =[];
    try{
        const books = await db.query( `SELECT books.title, books.review, books.overview , author.name 
             FROM books 
             JOIN author ON author.title = books.title 
             WHERE books.category LIKE '%' || $1 || '%';`,
            [category]);
        for(const book of books.rows){
            const query = QueryTitle(book.title);
            const url = `https://openlibrary.org/search.json?q=${query}`;
            const response = await axios.get(url);
            const firstResult = response.data.docs[0];
            const review = book.overview;
            const rate = book.review;
            let authorId = 0;
            let author ="";
            try {
                const result = await db.query(
                    "SELECT author.id , author.name FROM books JOIN author ON author.title = books.title WHERE books.title = $1;",
                    [book.title]
                );
                authorId = result.rows[0]?.id || 0;
                author = result.rows[0]?.name || null;
            } catch (err) {
                console.error("Database query failed:", err);
            }
            if (!firstResult) continue;
            
            results.push({
                title: book.title,
                id: firstResult.key,
                author: author,
                authorId : authorId,
                cover_i: firstResult.cover_i || null,
                review : review,
                rate: rate
            });
            console.log(authorId);
        }

        res.render('author', { books: results });

        
    }catch(err){
        console.log('type error: ',err);
    }
});

app.get("/top",async (req,res)=>{
    try {
        const results = [];
        const books = topBooks.slice(0,3);
        for (const book of books) {
            const query = QueryTitle(book.title);
            const url = `https://openlibrary.org/search.json?q=${query}`;
            const response = await axios.get(url);
            const firstResult = response.data.docs[0];
            const review = book.overview;
            const rate = book.review;
            let authorId = 0;
            let author ="";
            try {
                const result = await db.query(
                    "SELECT author.id , author.name FROM books JOIN author ON author.title = books.title WHERE books.title = $1;",
                    [book.title]
                );
                authorId = result.rows[0]?.id || 0;
                author = result.rows[0]?.name || null;
            } catch (err) {
                console.error("Database query failed:", err);
            }
            if (!firstResult) continue;
            
            results.push({
                title: book.title,
                id: firstResult.key,
                author: author,
                authorId : authorId,
                cover_i: firstResult.cover_i || null,
                review : review,
                rate:rate
            });
            console.log(authorId);
        }

        res.render('index', { books: results });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal Server Error" });
    }
});



app.listen(port, () => {
    console.log(`Server Launched at port ${port}`);
});

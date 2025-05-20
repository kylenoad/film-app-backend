const pool = require("../connection");
const {
  users,
  films,
  watchlist,
  watched,
  comments,
} = require("../data/development-data");

async function seed() {
  try {
    //----------------------------------------------------------------REMEBER TO REMOVE------------------------------------------------------------------------
    await pool.query("DROP TABLE IF EXISTS comments CASCADE");
    await pool.query("DROP TABLE IF EXISTS watchlist CASCADE");
    await pool.query("DROP TABLE IF EXISTS watched CASCADE");
    await pool.query("DROP TABLE IF EXISTS users CASCADE");
    await pool.query("DROP TABLE IF EXISTS films CASCADE");
    //----------------------------------------------------------------REMEBER TO REMOVE------------------------------------------------------------------------

    await pool.query(`
      CREATE TABLE users (
        id SERIAL PRIMARY KEY,
        username TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pool.query(`
      CREATE TABLE films (
        id SERIAL PRIMARY KEY,
        tmdb_id INTEGER UNIQUE NOT NULL,
        title TEXT NOT NULL,
        release_date DATE,
        poster_url TEXT,
        overview TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pool.query(`
      CREATE TABLE watchlist (
        id SERIAL PRIMARY KEY,
        user_id INT REFERENCES users(id) ON DELETE CASCADE,
        film_id INT REFERENCES films(id) ON DELETE CASCADE,
        UNIQUE(user_id, film_id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pool.query(`
      CREATE TABLE watched (
        id SERIAL PRIMARY KEY,
        user_id INT REFERENCES users(id) ON DELETE CASCADE,
        film_id INT REFERENCES films(id) ON DELETE CASCADE,
        UNIQUE(user_id, film_id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pool.query(`
      CREATE TABLE comments (
        id SERIAL PRIMARY KEY,
        user_id INT REFERENCES users(id) ON DELETE CASCADE,
        film_id INT REFERENCES films(id) ON DELETE CASCADE,
        content TEXT,
        rating INTEGER CHECK (rating >= 1 AND rating <= 10),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    for (const { username, email, password } of users) {
      await pool.query(
        `INSERT INTO users (username, email, password) VALUES ($1, $2, $3)`,
        [username, email, password]
      );
    }

    for (const {
      tmdb_id,
      title,
      release_date,
      poster_url,
      overview,
    } of films) {
      await pool.query(
        `INSERT INTO films (tmdb_id, title, release_date, poster_url, overview) VALUES ($1, $2, $3, $4, $5)`,
        [tmdb_id, title, release_date, poster_url, overview]
      );
    }

    const usersRes = await pool.query("SELECT id, username FROM users");
    const filmsRes = await pool.query("SELECT id, tmdb_id FROM films");

    const userIdMap = new Map(
      usersRes.rows.map((row) => [row.username, row.id])
    );
    const filmIdMap = new Map(
      filmsRes.rows.map((row) => [row.tmdb_id, row.id])
    );

    for (const entry of watchlist) {
      const user_id = userIdMap.get(entry.username);
      const film_id = filmIdMap.get(entry.tmdb_id);
      if (user_id && film_id) {
        await pool.query(
          `INSERT INTO watchlist (user_id, film_id) VALUES ($1, $2)`,
          [user_id, film_id]
        );
      }
    }

    for (const entry of watched) {
      const user_id = userIdMap.get(entry.username);
      const film_id = filmIdMap.get(entry.tmdb_id);
      if (user_id && film_id) {
        await pool.query(
          `INSERT INTO watched (user_id, film_id) VALUES ($1, $2)`,
          [user_id, film_id]
        );
      }
    }

    for (const { username, tmdb_id, content, rating } of comments) {
      const user_id = userIdMap.get(username);
      const film_id = filmIdMap.get(tmdb_id);
      if (user_id && film_id) {
        await pool.query(
          `INSERT INTO comments (user_id, film_id, content, rating) VALUES ($1, $2, $3, $4)`,
          [user_id, film_id, content, rating]
        );
      }
    }

    console.log("Database seeded successfully!");
    process.exit(0);
  } catch (err) {
    console.error("Seeding failed:", err);
    process.exit(1);
  }
}

module.exports = seed;

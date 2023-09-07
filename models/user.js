/** User class for message.ly */
const db = require("../db");
const bcrypt = require("bcrypt");
const { BCRYPT_WORK_FACTOR, SECRET_KEY } = require("../config");
const ExpressError = require("../expressError");
const message = require("./message");

/** User of the site. */

class User {
	constructor({
		id,
		username,
		password,
		first_name,
		last_name,
		phone,
		join_at,
		last_login_at,
	}) {
		this.id = id;
		this.username = username;
		this.password = password;
		this.first_name = first_name;
		this.last_name = last_name;
		this.phone = phone;
		this.join_at = join_at;
		this.last_login_at = last_login_at;
	}

	/** register new user -- returns
	 *    {username, password, first_name, last_name, phone}
	 */

	static async register({ username, password, first_name, last_name, phone }) {
		try {
			// NOTE this is similar to a post request - creating an instance of a new user
			const hashedPassword = await bcrypt.hash(password, BCRYPT_WORK_FACTOR);
			const result = await db.query(
				`INSERT INTO users (username, password, first_name, last_name, phone, join_at, last_login_at)
			VALUES ($1, $2, $3, $4, $5, current_timestamp, current_timestamp)
			RETURNING username, first_name, last_name, phone`,
				[username, hashedPassword, first_name, last_name, phone]
			);
			return new User(result.rows[0]);
		} catch (error) {
			// Handle the error here (e.g., log it or rethrow a custom error)
			throw new Error(`Error registering user: ${error.message}`);
		}
	}

	/** Authenticate: is this username/password valid? Returns boolean. */

	static async authenticate(username, password) {
		try {
			// NOTE this is similar to a get request
			const result = await db.query(
				`SELECT password FROM users WHERE username = $1`,
				[username]
			);
			const user = result.rows[0];
			if (user) {
				return await bcrypt.compare(password, user.password);
			}
			return false;
		} catch (error) {
			// Handle the error here (e.g., log it or rethrow a custom error)
			throw new Error(`Error authenticating user: ${error.message}`);
		}
	}

	/** Update last_login_at for user */

	static async updateLoginTimestamp(username) {
		try {
			// NOTE this is similar to a patch request
			const result = await db.query(
				`UPDATE users SET last_login_at = current_timestamp WHERE username = $1 RETURNING username`,
				[username]
			);
			if (!result.rows[0]) {
				throw new ExpressError("User not found", 404);
			}
			return result.rows[0];
		} catch (error) {
			// Handle the error here (e.g., log it or rethrow a custom error)
			throw new Error(`Error updating login timestamp: ${error.message}`);
		}
	}
	/** All: basic info on all users:
	 * [{username, first_name, last_name, phone}, ...] */

	static async all() {
		try {
		  // NOTE this is similar to a get request
		  const result = await db.query(
			`SELECT username, first_name, last_name, phone FROM users`
		  );
		  // Use the results to create a new user
		  return result.rows.map(row => new User(row));  //ANCHOR - we want to get all these users, but they should also be objects
		} catch (error) {
		  throw new Error(`Error fetching all users: ${error.message}`);
		}
	}
	  

	/** Get: get user by username
	 *
	 * returns {username,
	 *          first_name,
	 *          last_name,
	 *          phone,
	 *          join_at,
	 *          last_login_at } */

	static async get(username) {
		try {
			const result = await db.query(
				`SELECT username, first_name, last_name, phone, join_at, last_login_at FROM users WHERE username = $1`,
				[username], //ANCHOR - this is the username we want to get
			);
			if (!result.rows[0]) {
				throw new ExpressError("User not found", 404);
			} else {
				return result.rows[0];
			}
		} catch (error) {
			throw new Error(`Error fetching user: ${error.message}`);
		}
	}

	/** Return messages from this user.
	 *
	 * [{id, to_user, body, sent_at, read_at}]
	 *
	 * where to_user is
	 *   {username, first_name, last_name, phone}
	 */

	static async messagesFrom(username) {
		try {
			const result = await db.query(
				`SELECT m.id, m.body, m.sent_at, m.read_at, u.username, u.first_name, u.last_name, u.phone
				FROM messages AS m
				JOIN users AS u ON m.to_username = u.username
				WHERE m.from_username = $1`,
				[username]
			)
			let messages = result.rows.map(m => ({
				id: m.id,
				to_user: {
					username: m.username,
					first_name: m.first_name,
					last_name: m.last_name,
					phone: m.phone,
				},
				body: m.body,
				sent_at: m.sent_at,
				read_at: m.read_at,
			}));
			return messages;
		} catch (error) {
			throw new Error(`Error fetching messages from user: ${error.message}`);
		}
	}

	/** Return messages to this user.
	 *
	 * [{id, from_user, body, sent_at, read_at}]
	 *
	 * where from_user is
	 *   {username, first_name, last_name, phone}
	 */

	static async messagesTo(username) {
		try {
			const result = await db.query(
				`SELECT m.id, m.body, m.sent_at, m.read_at, u.username, u.first_name, u.last_name, u.phone
				FROM messages AS m
				JOIN users AS u ON m.from_username = u.username
				WHERE m.to_username = $1`,
			   [username]
			)		
			let messages = result.rows.map(m => ({
				id: m.id,
				from_user: {
					username: m.username,
					first_name: m.first_name,
					last_name: m.last_name,
					phone: m.phone,
				},
				body: m.body,
				sent_at: m.sent_at,
				read_at: m.read_at,
			}));
			return messages;	
		} catch (error) {
			throw new Error(`Error fetching messages to user: ${error.message}`);
		}
	}
}

module.exports = User;

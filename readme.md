# Eventify Backend

This is the backend for the Eventify platform.  
It provides endpoints for managing users, services, bookings, analytics, and more in the feature !

---

## Requirements

- **Node.js**: v24 or higher
- **npm**: v10 or higher (comes with Node.js)
- **Database**: MySQL / MariaDB (configured in `.env`)
- **Sequelize** ORM
- **N8N** for email sender service

---

## Installation

1. **Clone the repository**

```bash
git clone https://github.com/sw-hx/eventify-backend.git
cd eventify-backend
```

2. **Install dependencies**

```bash
npm install
```

3. **Create database**

```bash
cd mysql_database/

mysql -u your_username -p
```

enter your password

```mysql
mysql> create database database_name;
mysql> use database_name;
mysql> source eventify_db_v1.sql;
mysql> exit
```

4. **Create a .env file in the root directory based on .env.example**

```env
# ===========================
# Backend Configuration
# ===========================

# Available port number in your system
PORT=3000

# Your server base URL
BASE_URL=http://your-server-domain:3000

# default admin information
DEFAULT_ADMIN_EMAIL=admin@yourapp.com
DEFAULT_ADMIN_PASSWORD=SuperSecure123!

# ===========================
# Database Configuration
# ===========================
DATABASE_HOST=localhost
DATABASE_USER=your_db_username
DATABASE_PASSWORD=your_db_password
DATABASE_NAME=your_database_name

# ===========================
# JWT Configuration
# ===========================
JWT_SECRET=your_jwt_secret_key

# ===========================
# N8N Webhook / Email Sender
# ===========================
# URL of N8N endpoint used for sending emails
N8N_WEBHOOK_EMAIL_SENDER=https://your-n8n-server/webhook/email
```

## Running the Backend

### NOTE: Eventify backend is currently under heavy development.It is not recommended to run in a production environment yet.

```bash
npm run dev
```

## Notes

- Make sure the N8N workflow is configured to handle incoming **POST requests** and send emails.

- The workflow should expect **email**, **subject**, and **message** fields in the request JSON.

The backend does not retry automatically on failure (handle retries in N8N)

## 📝 Issues & Contributions

If you encounter any problems, have questions, or want to contribute:

- Open an issue on this repository for bugs or feature requests.
- Fork the repository and submit a pull request for improvements.

> Your feedback is always welcome XD

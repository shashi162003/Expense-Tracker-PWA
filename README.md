
# 💸 Personal Expense Tracker API

A RESTful backend API that allows users to track their personal expenses, set weekly spending limits, and receive automatic email alerts when limits are exceeded or as daily summaries.

---

## 🚀 Features

✅ User registration & login (JWT-based)  
✅ CRUD operations for expenses  
✅ Filter expenses by date, category, or amount  
✅ Set a **weekly spending limit**  
✅ Email alert if user crosses weekly limit  
✅ Daily email summary of all expenses  
✅ Role: Single user (expandable to multi-user later)

---

## 🏗️ Tech Stack

- **Backend:** Node.js + Express  
- **Database:** MongoDB (Mongoose)  
- **Authentication:** JWT + Bcrypt  
- **Email Service:** Nodemailer (Gmail or SendGrid)  
- **Scheduler:** node-cron

---

## 📦 Folder Structure

```
/expense-tracker-api
├── /config           // DB connection, env config
├── /controllers      // Auth + Expense controllers
├── /models           // Mongoose models (User, Expense)
├── /routes           // Auth + Expense routes
├── /middleware       // Auth middlewares (JWT)
├── /cron             // Cron jobs (daily summary)
├── /utils            // Mailer, helpers
├── app.js           // Express app entry
├── .env             // Env variables (DB, JWT, Email)
├── package.json
```

---

## 🗃️ Database Models

### User
| Field         | Type      |
|--------------|-----------|
| username     | String    |
| email        | String    |
| password     | String (hashed) |
| weeklyLimit  | Number    |

### Expense
| Field     | Type      |
|-----------|-----------|
| userId    | ObjectId (ref User) |
| title     | String    |
| amount    | Number    |
| category  | String    |
| date      | Date      |
| note      | String    |

---

## 📖 API Endpoints

### Auth
| Method   | Route               | Description           |
|----------|---------------------|-----------------------|
| POST     | /api/auth/register  | Register new user     |
| POST     | /api/auth/login     | Login, receive JWT    |

### Expenses
| Method   | Route                  | Description                        |
|----------|------------------------|------------------------------------|
| GET      | /api/expenses          | Get all user expenses (with filters) |
| POST     | /api/expenses          | Add a new expense (triggers weekly limit check) |
| PUT      | /api/expenses/:id      | Update an expense                 |
| DELETE   | /api/expenses/:id      | Delete an expense                 |

### Reports
| Method   | Route                     | Description                       |
|----------|---------------------------|-----------------------------------|
| GET      | /api/reports/monthly      | Get monthly spending summary      |
| GET      | /api/reports/category     | Get category-wise summary         |

### User
| Method   | Route                    | Description                      |
|----------|--------------------------|----------------------------------|
| PUT      | /api/users/:id/limit     | Set/update weekly spending limit |

---

## ✉️ Email Alerts

- **Limit Alert:**  
  When a user’s weekly expenses exceed the `weeklyLimit`, an automatic alert email is sent.

- **Daily Summary Email:**  
  Every night (configurable), the system sends a summary email listing all expenses for that day.

---

## 🛠️ Setup & Run

1️⃣ **Clone repo**  
```bash
git clone https://github.com/your-username/expense-tracker-api.git
cd expense-tracker-api
```

2️⃣ **Install dependencies**  
```bash
npm install
```

3️⃣ **Set environment variables**  
Create `.env` file:
```
PORT=5000
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_password_or_app_password
```

4️⃣ **Run the server**  
```bash
npm run dev
```

---

## ⚙️ Scheduled Jobs

The app uses `node-cron` to:
- Run a **daily summary email** job at 23:59  
- (Optional) Can be expanded for weekly reports, monthly stats

---

## 🔐 Security Notes

- Passwords are hashed using Bcrypt before storage.
- JWT tokens are used for protected routes.
- Sensitive info (DB URI, email creds) stored in `.env`.

---

## 🌟 Future Improvements

- Multi-user support with admin roles
- Attach receipts (file uploads)
- Push notifications (mobile)
- Monthly spending goals
- Integration with bank APIs

---

## 💬 API Testing

- Import provided Postman collection (`postman_collection.json`)  
- Test endpoints for auth, expenses, and reports

---

## 🧑‍💻 Author

**Shashi Kumar Gupta**  
Feel free to connect or contribute! ✨

# SpendWise — Track • Save • Grow

A full-stack personal finance tracker built with **React + Vite + Tailwind CSS** (frontend) and **Node.js + Express + MongoDB (Mongoose)** (backend). JavaScript only.

**Pages:** Login, Signup, Forgot/Reset password, Dashboard, Transactions, Budgets, Analytics, Reports, Settings.

---

## 1. What you need installed

| Tool | Version | Check with | Get it from |
|---|---|---|---|
| Node.js (includes npm) | 18 or newer (20 recommended) | `node -v` and `npm -v` | https://nodejs.org (LTS) |
| MongoDB | 6 or newer (local) **or** a free MongoDB Atlas cluster | `mongosh --version` (local only) | see step 3 |
| VS Code (or any editor) | any | | https://code.visualstudio.com |

---

## 2. Folder structure

```
spendwise/
├─ README.md
├─ client/                      React app (port 5173)
│  └─ src/
│     ├─ components/            Sidebar, Header, DateRangePicker, ProtectedRoute, charts/, ui/ (Button, Input, Modal...)
│     ├─ context/               AuthContext, ToastContext, DateRangeContext
│     ├─ features/              dashboard/, transactions/, budgets/ (page-specific pieces)
│     ├─ hooks/                 useAuth, useFetch
│     ├─ layouts/               AppLayout (sidebar shell), AuthLayout (login/signup shell)
│     ├─ pages/                 Login, Signup, ForgotPassword, ResetPassword, Dashboard, Transactions, Budgets, Analytics, Reports, Settings
│     ├─ services/              api.js (axios), authService.js, dataService.js (all API calls)
│     └─ utils/                 format, categories, validators, errors
└─ server/                      Express API (port 5000)
   ├─ config/db.js              MongoDB connection
   ├─ models/                   User, Transaction, Budget
   ├─ controllers/              auth, user, transaction, dashboard, budget, analytics, report
   ├─ routes/                   one file per area
   ├─ middleware/               auth (JWT cookie check), rateLimiters, errorHandler
   ├─ services/                 stats (aggregations), emailService, demoData
   ├─ utils/                    dates, validators, token, constants...
   ├─ database/setup.mongodb.js optional mongosh script (see step 4)
   ├─ scripts/demo.js           command-line demo data loader
   ├─ app.js, server.js
   └─ .env.example
```

---

## 3. Set up MongoDB (choose ONE option)

### Option A — MongoDB on your own computer
1. Install **MongoDB Community Server** from https://www.mongodb.com/try/download/community (also install *MongoDB Compass* if asked; it is a visual viewer).
2. Make sure the MongoDB service is running:
   - **Windows:** it installs as a service and starts automatically. Check: open *Services* → "MongoDB Server" → Running.
   - **macOS (Homebrew):** `brew tap mongodb/brew && brew install mongodb-community && brew services start mongodb-community`
   - **Linux (Ubuntu):** `sudo systemctl start mongod` (and `sudo systemctl enable mongod` to start on boot)
3. Your connection string is: `mongodb://127.0.0.1:27017/spendwise`

### Option B — MongoDB Atlas (free cloud database, no installation)
1. Create an account at https://www.mongodb.com/cloud/atlas and create a **free (M0)** cluster.
2. **Database Access** → *Add New Database User* → choose a username + password (write them down). Avoid special characters like `@ : /` in the password.
3. **Network Access** → *Add IP Address* → *Allow access from anywhere* (`0.0.0.0/0`) for development.
4. **Database** → *Connect* → *Drivers* → copy the connection string. It looks like  
   `mongodb+srv://USERNAME:PASSWORD@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority`  
5. Insert the database name `spendwise` before the `?`, and replace USERNAME and PASSWORD:  
   `mongodb+srv://USERNAME:PASSWORD@cluster0.xxxxx.mongodb.net/spendwise?retryWrites=true&w=majority`

---

## 4. Create the database, collections and indexes

**The app creates everything automatically** the first time it saves data, so this step is optional. Do it if you want the database to exist (with validation rules) before you start.

**Local MongoDB**, from the `server` folder:
```bash
mongosh "mongodb://127.0.0.1:27017" --file database/setup.mongodb.js
```
**Atlas:** open the cluster → *Connect* → *Shell* (or use mongosh with your Atlas string) and paste the script below.

Or open `mongosh` and **copy-paste this whole script** (it is the same as `server/database/setup.mongodb.js`):

```js
// Optional: creates the SpendWise database with validation rules and indexes.
// Run:  mongosh "mongodb://127.0.0.1:27017" --file database/setup.mongodb.js
// (The app also creates collections and indexes by itself; this file just makes everything explicit.)
const sdb = db.getSiblingDB('spendwise');

function ensure(name, schema) {
  const options = { validator: { $jsonSchema: schema }, validationLevel: 'moderate', validationAction: 'error' };
  if (sdb.getCollectionNames().includes(name)) sdb.runCommand({ collMod: name, ...options });
  else sdb.createCollection(name, options);
}
const num = ['double', 'int', 'long', 'decimal'];

ensure('users', {
  bsonType: 'object',
  required: ['name', 'email', 'passwordHash', 'currency'],
  properties: {
    name: { bsonType: 'string', minLength: 2, maxLength: 60 },
    email: { bsonType: 'string' },
    passwordHash: { bsonType: 'string' },
    currency: { enum: ['INR', 'USD', 'EUR', 'GBP'] },
  },
});
ensure('transactions', {
  bsonType: 'object',
  required: ['userId', 'title', 'type', 'amount', 'category', 'date'],
  properties: {
    userId: { bsonType: 'objectId' },
    title: { bsonType: 'string', maxLength: 100 },
    type: { enum: ['income', 'expense'] },
    amount: { bsonType: num, minimum: 0.01 },
    category: { bsonType: 'string' },
    date: { bsonType: 'date' },
    isDemo: { bsonType: 'bool' },
  },
});
ensure('budgets', {
  bsonType: 'object',
  required: ['userId', 'category', 'month', 'limitAmount'],
  properties: {
    userId: { bsonType: 'objectId' },
    category: { bsonType: 'string' },
    month: { bsonType: 'string', pattern: '^\\d{4}-(0[1-9]|1[0-2])$' },
    limitAmount: { bsonType: num, minimum: 0.01 },
  },
});

sdb.users.createIndex({ email: 1 }, { unique: true });
sdb.transactions.createIndex({ userId: 1, date: -1 });
sdb.transactions.createIndex({ userId: 1, type: 1, category: 1 });
sdb.budgets.createIndex({ userId: 1, month: 1, category: 1 }, { unique: true });

print('SpendWise database ready. Collections: ' + sdb.getCollectionNames().join(', '));
```

### Useful MongoDB queries (run in `mongosh`, or Compass → "MONGOSH" tab)
```js
use spendwise                                   // switch to the database

show collections                                // users, transactions, budgets
db.users.find({}, { name: 1, email: 1, currency: 1 })     // list users (passwordHash hidden)
db.users.countDocuments()

db.transactions.find().sort({ date: -1 }).limit(5)        // 5 newest transactions
db.transactions.countDocuments({ type: "expense" })
db.transactions.aggregate([                               // total per category
  { $match: { type: "expense" } },
  { $group: { _id: "$category", total: { $sum: "$amount" } } },
  { $sort: { total: -1 } }
])
db.budgets.find({ month: "2026-10" })

// Remove only the demo rows (same as the "Remove demo data" button)
db.transactions.deleteMany({ isDemo: true })
db.budgets.deleteMany({ isDemo: true })

// Delete ONE user and everything they own (replace the email)
const u = db.users.findOne({ email: "you@example.com" })
db.transactions.deleteMany({ userId: u._id })
db.budgets.deleteMany({ userId: u._id })
db.users.deleteOne({ _id: u._id })

// Start completely fresh (deletes ALL data!)
db.dropDatabase()
```

---

## 5. Set up and start the backend

```bash
cd server
npm install
```
Create your settings file:
- macOS/Linux: `cp .env.example .env`
- Windows (PowerShell): `copy .env.example .env`

Open `server/.env` and set:

| Variable | What it does | What to put |
|---|---|---|
| `PORT` | API port | keep `5000` |
| `NODE_ENV` | `development` locally, `production` when deployed | keep `development` |
| `MONGODB_URI` | Database address | from step 3 |
| `JWT_SECRET` | Secret used to sign login cookies. **Must be long and random.** | generate one (below) |
| `CLIENT_URL` | Where the React app runs (used for CORS + reset links) | keep `http://localhost:5173` |
| `COOKIE_SAMESITE` | Cookie policy | keep `lax` (see deployment notes) |
| `SMTP_*`, `EMAIL_FROM` | Optional, for real password-reset emails | leave empty for now |

Generate a secret:
```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```
Start the API:
```bash
npm run dev
```
You should see `MongoDB connected: ...` and `API running on http://localhost:5000`.  
Test it: open http://localhost:5000/api/health in the browser → `{"success":true,"message":"SpendWise API is running"}`.

> Keep this terminal open. Never commit `.env` to Git (it is already in `.gitignore`).

---

## 6. Set up and start the frontend

Open a **second terminal**:
```bash
cd client
npm install
npm run dev
```
Open **http://localhost:5173**. Vite forwards every `/api` request to the backend on port 5000, so you do not configure anything else.

---

## 7. First run walkthrough

1. Open http://localhost:5173 → click **Create an account** → sign up (password: 8+ chars, upper + lower case + a number).
2. You land on the Dashboard (empty, with helpful empty states).
3. Click **Add Transaction** (Quick Actions) and add an income and a few expenses.
4. Go to **Budgets** → *Add Budget* → set a limit for a category you spent in → watch the progress bar.
5. Open **Analytics** and **Reports**; change the date range at the top right; export a CSV from Reports.
6. Want instant data? **Settings → Demo data → Load demo data** (about 4 months of sample data, tagged `DEMO`; remove with one click).
   Command-line alternative: `cd server && npm run demo:load -- you@example.com` (and `npm run demo:clear -- you@example.com`).

### Forgot password in development
Email is optional. With `SMTP_HOST` empty, the **reset link is printed in the backend terminal**:
```
[DEV MODE - SMTP not configured] Password reset link for you@example.com:
http://localhost:5173/reset-password?token=...
```
Open that link to set a new password. (The link is valid for 1 hour and works once.)
To send real emails, fill `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `EMAIL_FROM` (for Gmail use `smtp.gmail.com`, port `587`, and a Google **App Password**). In production, with no SMTP configured, no email is sent.

---

## 8. How the important things work

- **Login:** the server checks the password with bcrypt, then sets a signed JWT in an **HttpOnly cookie**. JavaScript in the browser cannot read it. "Remember me" = 30-day cookie; otherwise it ends when the browser closes. Logout clears the cookie.
- **Data ownership:** every query includes `userId` taken from the logged-in cookie, never from the request. Opening another user's record returns 404.
- **Money rules (everywhere):** Opening balance = 0. Balance = income − expenses in the selected period. Savings rate = (income − expenses) ÷ income × 100, and 0 when income is 0. "vs previous period" compares with the previous calendar month for whole-month ranges, otherwise with the equal-length period before.
- **Budgets** are limits only; *spent* is always calculated from real expense transactions. One budget per user + month + category. Only the limit is editable (delete + re-create to change category).
- **Dates** are `YYYY-MM-DD` strings stored as UTC midnight, so a date never shifts by a day.
- **Currency:** INR by default; changing it in Settings changes how amounts are displayed (it does not convert values).
- **Dashboard bars** show the 6 months ending at the selected period; the donut and cards use the selected date range.

### API reference (all under `/api`, JSON; private routes need the login cookie)
| Method + path | Purpose |
|---|---|
| POST `/auth/register` · `/auth/login` · `/auth/logout` | Account + session |
| GET `/auth/me` | Current user |
| POST `/auth/forgot-password` · `/auth/reset-password` | Password reset |
| GET `/transactions?type&category&paymentMethod&search&from&to&sortBy&order&page&limit` | List (paginated) |
| POST `/transactions` · GET/PATCH/DELETE `/transactions/:id` | Create, read, update, delete |
| GET `/dashboard/summary` · `/dashboard/charts` · `/dashboard/recent-transactions` | Dashboard data (`from`, `to`) |
| GET/POST `/budgets` (`?month=YYYY-MM`) · PATCH/DELETE `/budgets/:id` | Budgets |
| GET `/analytics/summary` · `/analytics/spending-by-category` · `/analytics/monthly-trends` | Analytics |
| GET `/reports/summary` · `/reports/export` (CSV) | Reports (the two report routes are an addition to your list) |
| GET/PATCH `/users/profile` · PATCH `/users/password` | Settings |
| POST/DELETE `/users/demo-data` | Load / remove demo data (addition) |

---

## 9. Troubleshooting

| Problem | Fix |
|---|---|
| `MongooseServerSelectionError` / `ECONNREFUSED 127.0.0.1:27017` | MongoDB is not running. Start the service (step 3A) or check your Atlas string/IP allow-list (3B). |
| `MONGODB_URI is missing` / `JWT_SECRET is missing or too short` | You did not create `server/.env`, or did not fill it in. |
| Atlas: `bad auth` | Wrong username/password in the URI. URL-encode special characters in the password. |
| `EADDRINUSE :::5000` | Something already uses port 5000. Stop it, or change `PORT` in `.env` **and** the proxy target in `client/vite.config.js`. |
| Page shows "Cannot reach the server" | Backend is not running, or crashed. Check the first terminal. |
| You get sent back to Login again and again | Open the app via `http://localhost:5173` (not 127.0.0.1) and make sure `CLIENT_URL` in `.env` matches exactly. Restart the backend after editing `.env`. |
| `npm install` fails on `bcrypt` | Use Node 18/20 LTS. On Windows, installing "Desktop development with C++" build tools can help; otherwise try `npm install bcrypt --build-from-source=false`. |
| "Index ... already exists with different options" | You created an index by hand with other options. In mongosh: `use spendwise` then `db.<collection>.dropIndexes()` and restart the API. |

---

## 10. Deploying (outline)

1. **Database:** MongoDB Atlas (step 3B). Allow your host's IP (or `0.0.0.0/0`).
2. **API** (Render, Railway, etc.): root `server`, build `npm install`, start `npm start`. Set env vars: `NODE_ENV=production`, `MONGODB_URI`, `JWT_SECRET`, `CLIENT_URL=<your frontend URL>`.
3. **Frontend** (Vercel, Netlify): root `client`, build `npm run build`, output `dist`. Set `VITE_API_URL=<your API URL>/api`. Add an SPA rewrite so every path serves `index.html`.
4. **Cookies across domains:** if the frontend and API are on **different domains**, set `COOKIE_SAMESITE=none` (HTTPS is required; `secure` is automatic in production). Using a custom domain with subdomains of one site keeps `lax` working.
5. Set up SMTP so password-reset emails really send.

---

## 11. Manual test checklist
- Sign up, log out, log in; wrong password shows "Invalid email or password".
- Visiting `/dashboard` while logged out redirects to Login.
- Add, edit, delete a transaction: cards, charts and budgets update.
- Try a duplicate budget (same category + month): rejected.
- Create a second account: it must see none of the first account's data.
- Export CSV and open it in Excel.
- Resize the browser to phone width: menu becomes a drawer, no sideways scrolling of the page.

## 12. Not built / known limits
- No dark theme yet.
- Email change asks for your current password but does not send a verification email.
- No recurring transactions, receipt uploads, or multi-currency conversion.
- The automated checks run so far: client production build, server start-up and request guards. The full flow against a live MongoDB has to be tried on your machine using the checklist above.

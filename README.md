# AutoBridge Lite — Smart Vehicle Management System

A college-project web app for manufacturers, showroom owners and customers.

- **Backend:** Java 21 · Spring Boot 3.3 · Spring Web · Spring Data JPA · Spring Security (BCrypt) · file-based H2 database
- **Frontend:** React 18 · Vite · plain CSS (design tokens, dark/light themes) · React Router · Lucide icons

> ## Honest status of this package
>
> This project was generated in an environment **without access to Maven Central or the npm registry**, so the
> code has **not been compiled, built or run**. What _was_ checked: the frontend JSX files and the Java files were
> parsed for syntax errors (see "Verification" below). Everything else — the Maven build, `mvn test`, `npm run build`,
> startup, login, CRUD, persistence — is **untested**. Please run the steps below once before your demo; if a
> compile error appears, it should be small and quick to fix (paste it back to Claude together with the file name).

## 1. Requirements

| Tool         | Version        | Check with      |
| ------------ | -------------- | --------------- |
| JDK          | 21 or newer    | `java -version` |
| Apache Maven | 3.9 or newer   | `mvn -v`        |
| Node.js      | LTS (20 or 22) | `node -v`       |

No database, Docker, API keys or Python are needed. The first run downloads Maven and npm packages, so you need internet once.

> The Maven Wrapper (`mvnw`) is **not** included because it could not be generated and verified offline. Install Maven instead (https://maven.apache.org/download.cgi), or open `backend/` in IntelliJ IDEA / VS Code and run `AutoBridgeApplication`.

## 2. Run it

### Option A — one script

- **Windows:** double-click `start.bat` (opens two windows: backend and frontend)
- **macOS / Linux:** `chmod +x start.sh && ./start.sh`

### Option B — two terminals (most reliable)

```bash
# Terminal 1 - Java backend
cd backend
mvn spring-boot:run

# Terminal 2 - React frontend
cd frontend
npm install
npm run dev
```

Then open **http://localhost:5173**

| Part               | URL                              |
| ------------------ | -------------------------------- |
| Website (React)    | http://localhost:5173            |
| Backend API (Java) | http://localhost:8080/api        |
| Health check       | http://localhost:8080/api/health |

The React dev server forwards every `/api` call to the Java backend, so no CORS setup is needed.

## 3. Demo accounts

| Role           | Email                         | Password    |
| -------------- | ----------------------------- | ----------- |
| Manufacturer   | `manufacturer@autobridge.com` | `Maker@123` |
| Showroom Owner | `bhavesh341377@gmail.com`     | `Show@123`  |
| Customer       | `customer@autobridge.com`     | `Buyer@123` |

The login page has one-click "fill" buttons for these. New customers can register on the website; manufacturer and showroom accounts cannot be created from the UI, and the API ignores any role sent by the client.

## 4. What is implemented

- **Login / Register** — split-screen login, show/hide password, validation messages, demo-account panel, customer-only registration.
- **Dashboard** — role-specific stat cards, a bar chart, recent enquiries and recent vehicles. All numbers come from `GET /api/dashboard` (computed from the database).
- **Catalogue** — photo cards, search, category / fuel / price filters, details modal, empty and loading states. Customers can send a purchase or test-drive enquiry from the modal.
- **Vehicle management** (Manufacturer) — table with add, edit and delete (with confirmation).
- **Inventory** (Showroom Owner edits, Manufacturer views) — stock per showroom, status badges, _Confirm delivery_ and _Record sale_ actions.
- **Enquiries** — customers see only their own; manufacturer/showroom staff see all and can change the status.
- **Profile & settings** — account details, theme choice, sign out, live backend health check.
- **Dark / light theme** toggle (default dark, saved in `localStorage`), both using the supplied palettes.

### Backend notes

- Authentication: `POST /api/auth/login` returns a random bearer token (kept in memory); React sends it as `Authorization: Bearer …`. Restarting the backend signs everyone out. Passwords are stored as BCrypt hashes.
- Authorization is enforced in Java with `@PreAuthorize` (manufacturer-only vehicle changes, showroom-only stock actions, customer-only enquiry creation, staff-only status updates).
- Errors are returned as JSON: `{"error": "message", "status": 400}`.
- Seed data (14 vehicles, 3 showrooms of stock, 6 enquiries, 5 users) is loaded only when the database is empty.

## 5. Troubleshooting

| Problem                                                       | Fix                                                                                                                                                                  |
| ------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Port 8080 was already in use`                                | Stop the other program, or start with `mvn spring-boot:run -Dspring-boot.run.arguments=--server.port=8081` and change the proxy target in `frontend/vite.config.js`. |
| `Port 5173 is already in use`                                 | Close the other Vite window.                                                                                                                                         |
| `mvn` / `java` / `node` not recognised                        | Install it and open a **new** terminal so PATH updates.                                                                                                              |
| `release version 21 not supported` / `invalid target release` | Your JDK is older than 21. Install JDK 21 and check `java -version`.                                                                                                 |
| Login page shows "Cannot reach the server"                    | The backend is not running. Start it and check http://localhost:8080/api/health.                                                                                     |
| "Your session expired" toast                                  | The backend was restarted; sign in again.                                                                                                                            |
| `npm install` fails                                           | Check your internet / proxy, delete `frontend/node_modules` and retry.                                                                                               |
| Vehicle photos show an illustration                           | The placeholder photo service could not be reached (offline). The app works without photos; you can paste your own image URL in _Edit vehicle_.                      |

### Reset the demo database

Stop the backend, delete the folder `backend/data/`, then start it again. Demo data is re-created.

## 6. Verification

Checked in the generation environment:

- Frontend `.jsx` / `.js` files parsed with the TypeScript compiler (syntax only).
- Java files parsed with `javac` (syntax only; Spring classes could not be resolved offline).

**Not verified (could not run):** `mvn test`, `mvn package`, `npm run build`, backend startup, health endpoint, React ↔ backend calls, login/logout, vehicle CRUD, enquiry creation, authorization checks, theme toggle in a browser, data persistence across restart.

The backend test class `AutoBridgeApplicationTests` (health, 401 without login, wrong password, forbidden vs. allowed vehicle creation, customer-only registration, enquiry creation, stock delivery) is included but has **never been executed**.

## 7. Other limitations

- Vehicle photos are generic keyword-based placeholders from `loremflickr.com`, so they may not match the exact model. Prices and specifications are illustrative demo data, not official figures.
- Showroom owners all share the same three showrooms (no per-owner showroom assignment).
- Tokens are stored in memory only (no refresh, no expiry) — fine for a demo, not for production.
- No automated frontend tests.

# WalletPro Enterprise Admin Panel

This is the production-ready frontend client for the WalletPro Enterprise Admin Panel. It has been fully converted to integrate seamlessly with the separately deployed enterprise backend REST APIs using a centralized, secure HTTP/API layer.

## Environment Variables

To connect to your enterprise backend, configure the following environment variables in your `.env` or production deployment system. A template is provided in `.env.example`.

```env
# API Base URL for WalletPro Enterprise Backend REST APIs
VITE_API_BASE_URL="http://localhost:3000/api"

# Application settings
VITE_APP_NAME="WalletPro Enterprise"
VITE_APP_ENV="development"
```

*Note: All secrets are securely maintained on the backend. Never store client secrets in the frontend environment.*

## Project Structure

The API integration layer is structured under `src/api/` and `src/utils/` to ensure clean separation of concerns and maximum modularity:

*   **`src/api/client.ts`**: The centralized Axios HTTP client. Automatically attaches JWT tokens and roles, intercepts responses to manage refresh tokens, manages timeouts (15s), handles offline states, and translates HTTP error statuses gracefully.
*   **`src/api/auth.ts`**: Authentication routes (`/auth/login`, `/auth/logout`, `/auth/refresh`, etc.).
*   **`src/api/dashboard.ts`**: Live system metrics, stream logs, and KPI updates.
*   **`src/api/users.ts`**: Core client management and profile modifications.
*   **`src/api/wallets.ts`**: Business actions such as manual adjustments, freeze triggers, and fund transfers.
*   **`src/api/transactions.ts`**: Standard ledger searches, clearing actions, and settlement/refund updates.
*   **`src/api/cards.ts`**: Digital/physical corporate card requests, security options, and merchant lock limits.
*   **`src/api/kyc.ts`**: Identity queues and priority classifications.
*   **`src/api/staff.ts`**: Directory of internal staff and access assignments.

## Connection with Backend

Each dashboard workspace uses service layers (`OperationsService`, `ComplianceService`, and `FinanceService`) that call the backend APIs. If the backend is down, slow, or offline, the panel gracefully falls back to secure localStorage caches. This maintains full app stability and resilience under slow connections or backend outages.

## How to Run Locally

1.  **Install Dependencies**:
    ```bash
    npm install
    ```
2.  **Add Configuration**:
    Create a `.env` file in the root based on `.env.example`.
3.  **Run Development Server**:
    ```bash
    npm run dev
    ```
4.  **Lint / Build**:
    ```bash
    npm run lint
    npm run build
    ```

## Production Deployment

The frontend compiles to static files inside the `dist/` folder via Vite:
```bash
npm run build
```
These static assets can be deployed to any static host (such as Cloud Run, Firebase Hosting, AWS S3, or Vercel).

LegalFlow --- AI-Powered Legal Case Management System
LegalFlow is a full-stack legal case management application built to
help law firms organize clients, cases, hearings, tasks, notes, and
documents in one place. It combines an ASP.NET Core Web API and
PostgreSQL backend with a React frontend and Gemini-powered AI
assistance.
> **Status:** Active development / portfolio project. Features and setup
> instructions may evolve as development continues.
Overview
LegalFlow centralizes day-to-day case-management workflows and provides
AI-assisted tools for reviewing case information and documents. AI
outputs are intended to support legal professionals, not replace
professional judgment or provide definitive legal advice.
Features
Case Management
Create, view, update, and manage legal cases.
Store case numbers, titles, descriptions, case types and statuses,
court and judge information, opposing parties, and relevant dates.
Associate cases with clients and assign a lawyer with an optional
assistant.
Client Management
Maintain client records and contact details.
Associate clients with legal cases.
Hearings, Tasks, and Notes
Record hearing information and schedules.
Track case-related tasks and follow-up work.
Store notes alongside case records.
Document Management
Upload, view, download, and manage case documents.
Store document metadata such as file name, type, description, and
file size.
Associate documents with their relevant case.
AI Case Summary
Generate a structured AI-assisted overview of a case.
Highlight key issues, current status, important dates, pending
actions, potential concerns, and recommended next steps.
AI Document Analysis
Use Google's Gemini API to analyze supported documents.
Produce a structured summary containing key points, dates, parties,
potential issues, important clauses, and a recommended action.
Save the generated summary and processing status when supported by
the configured backend.
Download AI case summaries and document-analysis reports as PDF from
the frontend where PDF export is enabled.
Authentication and Role-Aware Workflows
JWT-based authentication and current-user profile support.
Role-aware workflows for Admin, Lawyer, and Assistant users.
Assistant-to-lawyer reporting relationships and case-assignment
rules.
> Authorization and firm-level data isolation should be verified in the
> backend as well as the frontend before handling real legal data.
Technology Stack
Backend - C# - ASP.NET Core Web API (.NET 9) - Entity Framework
Core - PostgreSQL and Npgsql - FluentValidation - JWT authentication -
Google Gemini API
Frontend - React - TypeScript - Material UI (MUI) - Axios where
configured for API requests - CSS variables for shared theme colors -
jsPDF for client-side PDF report generation
Architecture
The backend is separated into projects to keep domain concepts,
application workflows, infrastructure, and HTTP endpoints distinct.
LegalFlow.Domain --- core entities and domain concepts.
LegalFlow.Application --- application services, interfaces,
DTOs, requests, and validation.
LegalFlow.Infrastructure --- EF Core persistence, repositories,
authentication infrastructure, file storage, and AI integration.
LegalFlow.Api --- controllers, middleware, dependency injection,
and API startup.
The React frontend communicates with the API over HTTP.
Repository Structure
``` text
LegalFlow/
├── LegalFlow.Domain/
├── LegalFlow.Application/
│   ├── AI/
│   ├── Auth/
│   ├── Cases/
│   ├── Clients/
│   └── ...
├── LegalFlow.Infrastructure/
│   ├── AI/
│   ├── Authentication/
│   ├── Persistence/
│   └── Storage/
└── LegalFlow.Api/
    ├── Controllers/
    ├── Middleware/
    └── Program.cs
```
The frontend may be in a separate folder or repository, depending on how
the project is published.
Prerequisites
.NET SDK compatible with the solution (currently targeting .NET 9).
Node.js and npm compatible with the frontend.
PostgreSQL.
Optional: pgAdmin or another PostgreSQL client.
A Gemini API key for AI features.
Check the `.csproj` and `package.json` files for exact dependency
versions and available frontend scripts.
Local Setup
1. Clone the repository
``` bash
git clone <YOUR_GITHUB_REPOSITORY_URL>
cd <YOUR_REPOSITORY_FOLDER>
```
Replace the placeholders with your repository URL and folder name.
2. Create a PostgreSQL database
Create a database for LegalFlow and configure the connection string. The
expected key is `ConnectionStrings:DefaultConnection`; verify it against
the current application configuration.
Example connection-string format:
``` text
Host=localhost;Port=5432;Database=LegalFlowDb;Username=YOUR_DB_USER;Password=YOUR_DB_PASSWORD
```
3. Configure backend secrets
From the folder containing `LegalFlow.Api.csproj`, initialize user
secrets if needed:
``` bash
dotnet user-secrets init
dotnet user-secrets set "ConnectionStrings:DefaultConnection" "Host=localhost;Port=5432;Database=LegalFlowDb;Username=YOUR_DB_USER;Password=YOUR_DB_PASSWORD"
```
If the Gemini options are configured to read `Gemini:ApiKey`, set the
key with:
``` bash
dotnet user-secrets set "Gemini:ApiKey" "YOUR_GEMINI_API_KEY"
```
Use the exact configuration key and model name expected by your current
code. Gemini model availability, quotas, and free-tier terms can change.
Never commit API keys, passwords, JWT signing keys, production
connection strings, or real client/case documents.
4. Restore and build the backend
From the solution root:
``` bash
dotnet restore
dotnet build
```
5. Apply database migrations
If migrations are already included in
`LegalFlow.Infrastructure/Persistence/Migrations`, run:
``` bash
dotnet ef database update --project LegalFlow.Infrastructure --startup-project LegalFlow.Api
```
If `dotnet-ef` is not installed, install a version compatible with the
EF Core packages in the solution:
``` bash
dotnet tool install --global dotnet-ef
```
Keep EF Core runtime, design, provider, and CLI tool versions
compatible.
6. Run the API
From the solution root:
``` bash
dotnet run --project LegalFlow.Api
```
Use the URL printed in the terminal for API requests. If HTTPS
redirection is enabled, use the configured HTTPS URL where appropriate.
7. Run the frontend
Navigate to the frontend directory containing `package.json`:
``` bash
npm install
npm run dev
```
These commands assume the frontend defines a `dev` script. If it does
not, use the script listed in `package.json`.
Configure the frontend API base URL using the configuration mechanism
already present in the frontend project. Do not place private
credentials in frontend source code.
AI and Document Support
AI features require a valid Gemini API key, a configured model, network
access from the backend, and available API quota.
Document support depends on the file types and extraction capabilities
implemented in the current version. Do not assume every Office file or
scanned document is supported unless parsing or OCR has been implemented
and tested.
AI output can be incomplete or inaccurate. Verify dates, obligations,
parties, clauses, and suggested actions against original records and
documents.
Security and Privacy
Legal information can be highly sensitive. Before using this project
with real client data:
Keep keys, passwords, JWT secrets, and connection strings out of
Git.
Use environment-specific configuration or a secret manager for
deployed environments.
Enforce authentication, authorization, and firm-level data isolation
in the backend.
Validate uploaded file types and sizes, generate safe storage names,
and protect against path traversal.
Restrict access to uploaded files and do not expose server file
paths.
Review the AI provider's privacy and data-handling terms before
sending case information or documents to it.
Use synthetic or anonymized data for demos and testing.
Back up the database and uploaded files before production use.
Current Limitations
The application is under active development; APIs, screens, and
configuration may change.
AI results require human review and are not legal advice.
Model availability, API limits, and free-tier terms are controlled
by the provider.
Document parsing and OCR depend on the currently implemented
file-type support.
Production use requires deployment-specific configuration, secure
storage, logging, backups, and a security review.
Roadmap
Potential future improvements include: - AI insights across case
history, hearings, tasks, notes, and analyzed documents. - More robust
extraction for Office files and scanned PDFs. - Expanded audit logging
and administrative controls. - Automated tests and CI/CD. - Production
deployment with managed database, secret management, HTTPS, monitoring,
and backups. - Improved reports and firm-level analytics.
Contributing
This is a portfolio and learning project. Suggestions, issues, and pull
requests are welcome.
Before submitting changes: 1. Keep secrets and real legal data out of
commits. 2. Explain the purpose and scope of the change. 3. Test the
affected backend and frontend workflows. 4. Update the README when setup
steps or features change.
Disclaimer
LegalFlow is a case-management and productivity application.
AI-generated summaries and analyses are not legal advice, do not
establish an attorney-client relationship, and must not replace review
by a qualified legal professional.
Author
Built as a full-stack portfolio project exploring legal case management,
clean backend architecture, and AI-assisted workflows.
---
Before publishing: Replace the repository placeholders above,
confirm that the feature list matches the current code, and check that
no `.env` files, secrets, database dumps, or confidential documents are
included in the repository.

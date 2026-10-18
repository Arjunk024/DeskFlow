# DeskFlow — IT Helpdesk & Asset Management System

A full-stack IT operations management application for handling support tickets, tracking IT assets, managing employees, and maintaining service records through a centralized dashboard.

**Built with React, TypeScript, ASP.NET Core, and Microsoft SQL Server.**

[![Frontend](https://img.shields.io/badge/Frontend-React%20%7C%20TypeScript-3178C6?logo=react)](https://react.dev/)
[![Backend](https://img.shields.io/badge/Backend-ASP.NET%20Core-512BD4?logo=dotnet)](https://dotnet.microsoft.com/)
[![Database](https://img.shields.io/badge/Database-SQL%20Server-CC2927?logo=microsoftsqlserver)](https://www.microsoft.com/en-us/sql-server)
[![Testing](https://img.shields.io/badge/Testing-xUnit-512BD4)](https://xunit.net/)
[![License](https://img.shields.io/badge/License-Not%20Specified-lightgrey)](#license)

**Repository:** https://github.com/Arjunk024/DeskFlow

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [API Overview](#api-overview)
- [Automated Testing](#automated-testing)
- [Security](#security)
- [Current Limitations and Future Improvements](#current-limitations-and-future-improvements)
- [Contributing](#contributing)
- [License](#license)

## Overview

DeskFlow is a full-stack IT helpdesk and asset management system designed to bring everyday IT operations into one workspace.

Support teams can manage incoming tickets, monitor their status, maintain an inventory of devices, track employee information, review asset assignment history, and record maintenance activities.

The application combines a React-based dashboard with a REST API built using ASP.NET Core and a SQL Server database for persistent storage.

### Project Goals

- Centralize IT support requests and status tracking.
- Improve visibility into hardware inventory and warranty information.
- Maintain employee and asset assignment records.
- Track maintenance schedules, completion status, and service costs.
- Introduce authenticated API access and role-based authorization.
- Provide a foundation for reporting, automated testing, and future deployment.

## Features

### 1. Dashboard and Analytics

- Summary cards for tickets, assets, maintenance costs, and warranty alerts.
- Live counts calculated from data loaded by the frontend.
- Ticket status distribution chart based on current ticket records.
- Recent ticket and activity sections.
- Asset health and maintenance summaries.

> Note: The ticket chart displays the current status distribution. Historical weekly analytics and trend calculations are not yet verified.

### 2. Ticket Management

- Create support tickets with titles, descriptions, requesters, categories, and priorities.
- Retrieve tickets from the backend.
- Update ticket statuses, including Open, In Progress, and Resolved.
- Display recent requests in a dashboard table.
- Record and display recent activity where supported by the configured API.

### 3. IT Asset Inventory

- Register and update IT assets.
- Track asset tags, names, categories, manufacturers, models, and assignees.
- Maintain purchase dates, warranty expiry dates, notes, and asset status.
- Display inventory health summaries.
- Identify expired and soon-to-expire warranties.
- Review asset assignment history.

### 4. Employee Directory

- Create and list employee records.
- Maintain employee codes, names, email addresses, departments, job titles, and status.
- Support employee record deletion.
- Provide a centralized directory for workspace management.

### 5. Asset Assignment History

- Retrieve assignment history for individual assets.
- Display previous and new assignees.
- Show when assignment changes were recorded.

### 6. Maintenance Management

- Create maintenance records linked to assets.
- Record maintenance type, description, scheduled date, cost, and technician.
- Track Scheduled, In Progress, and Completed statuses.
- Record completion dates and next service dates.
- View maintenance history and accumulated service costs.
- Delete maintenance records.

### 7. Authentication and Authorization

- Register accounts and authenticate users with email and password.
- Hash and verify passwords using ASP.NET Core Identity.
- Generate and validate JSON Web Tokens (JWTs).
- Include user identity and role claims in issued tokens.
- Apply authorization policies to protected API controllers and operations.

The intended roles are:

- **Admin** — administrative operations.
- **IT Support** — support and operational management.
- **Employee** — permitted employee-level access.

The exact permissions depend on the authorization attributes configured on each controller action. Full role-by-role integration testing and administrative role provisioning remain areas for verification.

## Technology Stack

| Layer | Technologies |
|---|---|
| Frontend | React, TypeScript, Vite |
| UI and Icons | CSS, Lucide React |
| Backend | ASP.NET Core Web API, .NET 10 |
| Authentication | ASP.NET Core Identity, JWT Bearer Authentication |
| ORM | Entity Framework Core |
| Database | Microsoft SQL Server |
| API Documentation | Swagger / OpenAPI |
| Testing | xUnit, Microsoft.NET.Test.Sdk, ASP.NET Core MVC Testing |
| Development Tools | Visual Studio Code, Git, GitHub |

## Architecture

```text
                    DeskFlow
                       |
          +------------+------------+
          |                         |
     React Frontend            ASP.NET Core API
     TypeScript + Vite          .NET 10
          |                         |
          |  HTTP / JSON            |
          +------------------------>|
                                    |
                          JWT Authentication
                                    |
                          Entity Framework Core
                                    |
                             SQL Server
```

The frontend communicates with backend controllers through HTTP requests. The API validates requests, applies authentication and authorization rules, and uses Entity Framework Core to interact with the database.

## Project Structure

```text
DeskFlow/
├── DeskFlow.Api/
│   ├── Controllers/
│   ├── Data/
│   ├── Models/
│   ├── Migrations/
│   ├── Program.cs
│   ├── appsettings.json
│   └── DeskFlow.Api.csproj
│
├── DeskFlow.Api.Tests/
│   ├── AuthenticationTests.cs
│   ├── UnitTest1.cs
│   └── DeskFlow.Api.Tests.csproj
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── services/
│   │   ├── App.tsx
│   │   └── App.css
│   ├── package.json
│   └── vite.config.ts
│
├── .gitignore
└── README.md
```

*The structure above reflects the principal project areas. Individual files and folders may evolve during development.*

## Getting Started

### Prerequisites

Install the following tools:

- [Git](https://git-scm.com/downloads)
- [Node.js](https://nodejs.org/) with npm
- [.NET 10 SDK](https://dotnet.microsoft.com/download/dotnet/10.0)
- [Microsoft SQL Server](https://www.microsoft.com/en-us/sql-server/sql-server-downloads)
- [Visual Studio Code](https://code.visualstudio.com/)

SQL Server Developer Edition is suitable for local development.

### 1. Clone the Repository

```bash
git clone https://github.com/Arjunk024/DeskFlow.git
cd DeskFlow
```

### 2. Configure the Database

Ensure your SQL Server instance is running.

Configure the `DeskFlowConnection` connection string in your local configuration. Use the server and authentication method appropriate for your machine.

Do not commit real database passwords or other credentials.

### 3. Configure JWT Authentication

The API requires a private JWT signing key. Configure it using .NET user-secrets rather than committing it to source control.

From the API project directory:

```powershell
cd DeskFlow.Api
dotnet user-secrets init
dotnet user-secrets set "Jwt:Key" "YOUR_PRIVATE_RANDOM_SECRET_KEY"
```

Generate your own random signing key of at least 32 bytes. Never use the example placeholder as a production secret.

Configure the JWT issuer, audience, and expiry settings to match the values expected by the application.

### 4. Apply Database Migrations

After configuring the database connection, run:

```powershell
dotnet ef database update
```

If the Entity Framework Core CLI is not installed, install it using the .NET tool installer. Run the command from the API project directory and confirm that the EF Core tools are compatible with the project's .NET and EF Core versions.

If the command cannot locate the required design-time services or project configuration, check the EF Core tooling setup before proceeding.

### 5. Install Frontend Dependencies

Open another terminal from the repository root:

```powershell
cd frontend
npm install
```

## Configuration

### Backend

The API is configured to use the following local development address:

```text
http://localhost:5251
```

Configuration includes:

- SQL Server connection string: `ConnectionStrings:DeskFlowConnection`
- JWT signing key: `Jwt:Key`
- JWT issuer: `Jwt:Issuer`
- JWT audience: `Jwt:Audience`
- JWT expiry: `Jwt:ExpiryMinutes`

The signing key should be supplied through user-secrets locally and through a secure environment-specific secret provider in production.

### Frontend

The frontend API services currently use the local API base URL:

```text
http://localhost:5251/api
```

The Vite development server normally runs at:

```text
http://localhost:5173
```

The backend CORS configuration must allow the frontend's origin. For production, configure the actual deployed frontend origin rather than allowing development origins indiscriminately.

> **Deployment note:** The current local API URL is development configuration, not a production endpoint. Production URL configuration and deployment are not yet verified.

## Running the Application

Run the backend and frontend in separate terminals.

### Start the Backend

From the repository root:

```powershell
cd DeskFlow.Api
dotnet restore
dotnet build
dotnet run
```

The configured development URL is:

```text
http://localhost:5251
```

If Swagger is enabled for the current development environment, open:

```text
http://localhost:5251/swagger
```

### Start the Frontend

Open a second terminal:

```powershell
cd frontend
npm install
npm run dev
```

Open the Vite URL shown in the terminal, normally:

```text
http://localhost:5173
```

Register an account through the application's registration screen and log in to access the dashboard.

Public registration creates Employee accounts. Administrative roles must be provisioned through a secure administrative or development process; public registration must not allow users to assign themselves elevated roles.

## API Overview

The following routes represent the principal API areas in the project. Confirm individual request schemas, response codes, and authorization attributes in the controller source or Swagger documentation before relying on them.

| Area | Example route | Purpose |
|---|---|---|
| Authentication | `POST /api/Auth/register` | Register an account |
| Authentication | `POST /api/Auth/login` | Authenticate and receive a JWT |
| Tickets | `/api/Tickets` | Manage support tickets |
| Assets | `/api/Assets` | Manage asset inventory |
| Employees | `/api/Employees` | Manage employee records |
| Maintenance | `/api/AssetMaintenance` | Manage maintenance records |
| Activity | `/api/activitylogs` | Retrieve recent activity, if configured |

Protected endpoints require a valid access token sent in the HTTP authorization header:

```http
Authorization: Bearer YOUR_JWT_TOKEN
```

Actual endpoint casing and supported HTTP methods should be checked against the corresponding controller route definitions.

## Automated Testing

DeskFlow includes an xUnit test project:

```text
DeskFlow.Api.Tests/
```

The project uses:

- xUnit
- Microsoft.NET.Test.Sdk
- Microsoft.AspNetCore.Mvc.Testing
- Microsoft.EntityFrameworkCore.InMemory

### Run the Tests

From the repository root:

```powershell
dotnet test .\DeskFlow.Api.Tests\DeskFlow.Api.Tests.csproj
```

### Current Test Coverage

The initial test suite has been run successfully in the development environment.

The current tests include:

- A basic test-runner smoke test.
- A login request with an empty JSON payload.
- An unauthenticated request to a protected asset endpoint.

The reported development run passed three tests. This confirms those specific test cases passed in that run; it does not establish comprehensive coverage of the application.

### Recommended Additional Tests

- Successful registration and login.
- Invalid credentials and duplicate registration.
- JWT expiry and invalid-signature handling.
- Admin, IT Support, and Employee authorization boundaries.
- Ticket creation and status updates.
- Asset creation, editing, and assignment history.
- Maintenance creation, status changes, and deletion.
- Database integration tests using an isolated test database.
- Frontend component and service tests.

## Security

Security is an ongoing part of the development process.

Current security measures include:

- Password handling through ASP.NET Core Identity.
- JWT Bearer token validation.
- Authorization attributes on protected controllers and operations.
- A development CORS policy for the local frontend.
- Local secret configuration through .NET user-secrets.
- Git exclusions for build artifacts, dependency folders, and environment files.

### Important Security Considerations

- Never commit real signing keys, passwords, connection-string credentials, or access tokens.
- Do not expose administrative role assignment through public registration.
- Review authorization rules on every API action.
- Use HTTPS in production.
- Configure production CORS origins explicitly.
- Review dependency vulnerability warnings and update affected packages to supported, patched versions.
- Use a secure production database configuration and backup strategy.
- Treat the development setup as separate from production deployment.

**Dependency review pending:** A previous development build reported a high-severity vulnerability warning involving `System.Security.Cryptography.Pkcs` version `9.0.11`. The affected dependency chain and remediation have not yet been verified as resolved.

## Current Limitations and Future Improvements

DeskFlow is an evolving project. The following items are planned or require additional verification.

- [ ] Complete role-by-role authorization testing.
- [ ] Add comprehensive API integration tests.
- [ ] Expand unit and frontend test coverage.
- [ ] Resolve and verify outstanding dependency vulnerability warnings.
- [ ] Implement historical analytics and trend reporting.
- [ ] Improve dashboard search and notification functionality.
- [ ] Add pagination, filtering, and sorting for larger datasets.
- [ ] Improve validation and error handling across API and frontend.
- [ ] Add structured logging and operational monitoring.
- [ ] Add screenshots and a product demonstration.
- [ ] Configure production database hosting and deployment.
- [ ] Add a live demo link after deployment is verified.

## Contributing

Contributions, suggestions, and bug reports are welcome.

1. Fork the repository.
2. Create a feature branch.
3. Make your changes.
4. Run the relevant build and tests.
5. Open a pull request describing the changes.

Please do not include credentials, secrets, or personal information in commits or issues.

## License

No license has been specified yet.

Until a license is added to the repository, permission to reuse, modify, or redistribute the project should not be assumed. Add an appropriate license file if you intend to permit public reuse.

---

**DeskFlow** — Building a more organized approach to IT support and asset management.

Repository: https://github.com/Arjunk024/DeskFlow

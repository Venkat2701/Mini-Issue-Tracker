# Mini Issue Tracker - Full Stack Application

A robust, full-stack issue tracking system featuring a .NET Core Web API backend and an Angular frontend. This application allows teams to securely manage, assign, and track the status of project issues.

## 📂 Repository Structure
This is a monorepo containing both the frontend and backend applications.
* `/Backend`: Contains the ASP.NET Core 8 Web API and Entity Framework configurations.
* `/Frontend`: Contains the Angular 18 Single Page Application (SPA).

---

## 🚀 Setup Instructions

### Prerequisites
* **SQL Server** (or SQL Express)
* **.NET 8 SDK** (or later)
* **Node.js** (v18+) and **Angular CLI**

### 1. Backend Setup & Database Configuration
1. Open the `/Backend/MiniIssueTrackerWebAPI.sln` solution in Visual Studio.
2. Open `appsettings.json` and ensure the `"DefaultConnection"` string points to your local SQL Server instance.
3. Open the **Package Manager Console** in Visual Studio and run the following command to create the database schema:
   `Update-Database`
4. Press **F5** to run the API. Swagger UI will automatically open in your browser to test endpoints.

### 2. Frontend Setup
1. Open a terminal and navigate to the `/Frontend` directory.
2. Install the required npm packages:
   `npm install`
3. Start the Angular development server:
   `ng serve`
4. Open your browser and navigate to `http://localhost:4200`.

*Note: You can register a new user via the "Request Access" page, but an Admin must approve the account before login is permitted.*

---

## 🏗️ Design Choices
* **Monolithic Repository (Monorepo):** Both projects are housed in a single repository to ensure the frontend and backend versions remain perfectly synchronized during code reviews and deployments.
* **Angular Material UI:** Selected for its enterprise-grade component library, ensuring a responsive, accessible, and clean user experience.
* **JWT Authentication:** Implemented stateless, token-based security via HTTP Interceptors to securely lock down API routes and display role-specific UI elements.
* **Database-First Entity Framework:** Allowed for strict relational database design while letting EF seamlessly scaffold the C# models.

## 🧗 Challenges Faced
* **CORS (Cross-Origin Resource Sharing):** Initially, the browser blocked the Angular frontend from communicating with the .NET backend. This was resolved by configuring a strict CORS policy in `Program.cs`.
* **Cyclic JSON References:** When linking an `Issue` to an `Assignee` (User), Entity Framework's eager loading caused an infinite loop in the JSON serialization. This was solved by implementing `ReferenceHandler.IgnoreCycles` in the API configuration.
* **Role-Based UI State:** Managing the asynchronous "Pending" vs "Active" user state required implementing a dual-tab management system and updating the login flow to gracefully reject unapproved users.
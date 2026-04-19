# Scripture Union Ethiopia (SUE) ERP System Overview

This document provides a comprehensive report on the full structure, functionality, and architectural design of the Scripture Union Ethiopia Regional Planning & Reporting Portal.

## 1. High-Level Architecture
The system is built as a modern, decoupled web application spanning frontend, backend, and a relational database.

*   **Frontend**: React.js (TypeScript) built with Vite. It heavily utilizes functional components, React Hooks, and React Router for Client-Side Routing. Styling is handled via vanilla CSS and Tailwind-inspired utility methodologies for a modern, responsive interface.
*   **Backend**: Node.js with Express.js acting as a RESTful API server. It manages session authentication, data validation, and aggregation logic.
*   **Database**: PostgreSQL managed via Prisma ORM for type-safe database queries, schema migrations, and strict relationship enforcement.

## 2. Role-Based Access Control (RBAC)
The overarching logic of the application centers on a strict 5-tier hierarchical access model. Users are assigned one of the following roles, meaning their views and data scopes are intrinsically isolated.

1.  **EXECUTIVE (National Director / Ministries)**: Full national visibility. Aggregates data from all regions. 
2.  **ADMIN (IT/System Operations)**: Manages users, system broadcasts, and configuration. Does not necessarily participate in field-reporting workflows.
3.  **COORDINATOR (Regional Staff)**: Oversees multiple Sub-Regions. Consolidates sub-regional reports into Regional Master Plans.
4.  **SUB_REGIONAL (Sub-Regional Staff)**: Gatekeepers and middle-managers. Approves Area-level data and summarizes performance for coordinators.
5.  **AREA_STAFF (Area Coordinators)**: On-the-ground staff covering specific clusters of schools. The primary source of primary data entry.

## 3. Core Functionality & Workflows

### 3.1 Unified Authentication
*   A single, unified login portal handles all users.
*   Upon successful authentication, the frontend router dynamically inspects the user's role and automatically redirects them to their designated Dashboard (`/area`, `/sub-regional`, `/regional`, `/admin`, or `/executive`).

### 3.2 Dynamic Dashboards (Strict Data Fidelity)
Each role features a custom dashboard tailored to their geographic scope.
*   **Zero-Default Data Integrity**: Every dashboard enforces a strict "Zero-Default" rule. If a metric (e.g., "Total Schools") is unpopulated in the database, the UI renders identically as `0` instead of using dummy/placeholder data.
*   **Empty State Handling**: Lists lacking data utilize a standardized Amharic fallback state: `"ምንም መረጃ አልተገኘም"` (No Information Found).

### 3.3 The "Amharic Form Wizard" (Reporting Engine)
*   **Purpose**: The primary engine for submitting "Annual Master Plans" and "Monthly Reports".
*   **Structure**: A multi-step accordion dividing qualitative and quantitative metrics into 7 distinct modules (General Information, Organizing, Teachings, Missions, Partnerships, Admin, and Budgets/Testimonies).
*   **Enforcement**: Employs empty string initializations for numeric inputs to force explicit user data entry, which are then strictly parsed to absolute zeros (`0`) if bypassed, strictly mapping to the JSON payload required by the Postgres database.

### 3.4 Multi-Tier Approval Workflows
The system incorporates vertical logic components to handle data vetting and aggregation from the ground up:
*   **Capacity Registration Workflow (`/capacity-workflow`)**: Area Staff submit raw staff/school numbers. Sub-Regional gates approve/reject. Approved numbers mathematically aggregate directly into the National Executive KPI view.
*   **Territory Registration Workflow (`/territory-workflow`)**: Regional Coordinators propose new Sub-Regions or Areas. The School Ministry (Executive) reviews and approves, officially incrementing the Global Master Map.
*   **Interactive Queues**: Both workflows execute lock-and-release mechanics: Area submissions lock the local form until a higher-up resolves the pending request inbox.

### 3.5 Organizational Visibility
*   **Live Deployment Tree (`/south-ethiopia-tree`)**: A visual, drill-down interactive map simulating the organizational chart (e.g., zooming from a Regional Director -> specific Sub-Regional Coordinator -> localized Area cards).

## 4. Frontend File Structure (Key Directories)
*   `/src/api/` - Handles REST API HTTP calls and data structures.
*   `/src/context/` - AuthContext for holding secure JWTs/sessions.
*   `/src/layouts/` - Role-specific navigation scaffolding (e.g., Sidebar, persistent headers).
*   `/src/pages/dashboards/` - The explicit views for `AreaDashboard`, `SubRegionalDashboard`, `ExecutiveDashboard`, etc.
*   `/src/pages/admin/` - IT/Admin interfaces for system health and user management.
*   `/src/pages/wizard/` - Contains the `AmharicFormWizard.tsx`.
*   `/src/pages/` - Contains our standalone workflow components (`CapacityWorkflow.tsx`, `TerritoryWorkflow.tsx`).

## 5. Security & Isolation ("Only My Data")
A core tenet of the ERP system is Horizontal & Vertical Data Isolation. An Area Coordinator logged into the system makes requests containing their `location_id`. The backend exclusively returns database rows matching that exact geographic constraint, masking and denying access to neighboring regions.

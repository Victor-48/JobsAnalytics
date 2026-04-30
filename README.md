# Job Portal Analytics Dashboard

A full-stack application designed to provide interactive analytics for job postings. The project features a React/Vite frontend with rich drag-and-drop charts, a Spring Boot backend, a Neo4j Graph Database, and an integrated LLM ("Ask your Data") feature powered by either Ollama or OpenAI.

## Prerequisites

Before running the project, ensure you have the following installed:

*   **Node.js** (v18 or higher) and `npm`
*   **Java Development Kit (JDK)** (Version 21)
*   **Maven**
*   **Neo4j Desktop** or **Neo4j Community Edition** (Running locally)
*   *(Optional but Recommended)* **Ollama** installed locally for the AI features.

---

## 1. Database Setup (Neo4j)

1. Open **Neo4j Desktop** and create a new project/database.
2. Start the database.
3. The application expects the database to be running on the default Bolt port (`7687`).
4. **Credentials:** By default, the application expects the username to be `memgraph` and no password.
    * If you are using a standard Neo4j installation, you likely need to update the credentials.
    * Open `DashboardJ/src/main/resources/application.properties`.
    * Update the following lines to match your Neo4j setup:
      ```properties
      graph.uri=bolt://localhost:7687
      graph.username=neo4j
      graph.password=your_password
      ```

---

## 2. LLM Setup (AI "Ask your Data" Feature)

The application supports natural language queries to generate charts. It is configured to use a local LLM via Ollama by default for privacy and cost-efficiency.

### Using Local Ollama (Default)
1. Download and install [Ollama](https://ollama.com/).
2. Open your terminal/command prompt and pull the required model (we use `llama3` by default):
   ```bash
   ollama pull llama3
   ```
3. Keep the Ollama application running in the background.

### Using OpenAI (Alternative)
If you prefer to use OpenAI's API instead of a local model:
1. Open `DashboardJ/src/main/resources/application.properties`.
2. Change the provider to openai:
   ```properties
   llm.provider=openai
   ```
3. Add your API key:
   ```properties
   openai.api.key=sk-your-actual-api-key-here
   ```

---

## 3. Running the Backend (Spring Boot)

1. Open a terminal and navigate to the backend directory:
   ```bash
   cd DashboardJ
   ```
2. Run the application using Maven:
   ```bash
   mvn spring-boot:run
   ```
3. The backend will start on `http://localhost:8080`.
   * *Note: Upon first run, the database will be empty. You can use the frontend to add jobs.*

---

## 4. Running the Frontend (React + Vite)

1. Open a **new** terminal window and navigate to the frontend directory:
   ```bash
   cd dashfront
   ```
2. Install the necessary dependencies (only needed the first time):
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
4. Open your browser and navigate to the URL provided in the terminal (usually `http://localhost:5173`).

---

## Features Guide

*   **Interactive Dashboard:** Drag and drop charts to reorganize your view. Use the "Focus View" to concentrate on a single metric, or click the "Pop-out" icon on any chart to create floating comparison windows.
*   **Ask Your Data:** Use the search box at the top of the dashboard to ask questions in natural language (e.g., "Show me average salaries for remote jobs as a bar chart").
*   **Theme Toggling:** Click the Sun/Moon icon in the top right navigation to switch between the Light (Hot Colors) and Dark (Cold Colors) themes.
*   **Data Management:** Use the "Jobs" and "Add New Job" pages to populate your Neo4j database. All charts will update automatically based on the data you enter.
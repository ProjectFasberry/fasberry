#  fasberry-minecraft

[![License](https://img.shields.io/github/license/ProjectFasberry/fasberry?style=for-the-badge)](./LICENSE)

This repository contains all the code for the Fasberry Minecraft ecosystem, including multiple frontend applications and shared packages, developed in a unified environment.

## 🚀 Getting Started

To get the project up and running locally, follow these steps:

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/ProjectFasberry/fasberry.git
    cd fasberry-minecraft
    ```

2.  **Install dependencies:**
    This project uses `bun` as the package manager.
    ```bash
    bun install
    ```

3.  **Run the development server:**
    This command will start all applications in development mode simultaneously.
    ```bash
    bun run dev
    ```

## 🛠️ Available Scripts

The most common scripts available at the root level are:

| Command      | Description                                                 |
|--------------|-------------------------------------------------------------|
| `bun run dev`   | Starts all applications in development mode.                |
| `bun run build` | Builds all applications and packages for production.        |
| `bun run start` | Starts all applications.                                    |

## 📚 Documentation

This README provides a high-level overview of the monorepo structure. For comprehensive information on specific applications, the build system, and shared libraries, please visit the **[Official Documentation](https://deepwiki.com/ProjectFasberry/fasberry/1-overview)**.

The documentation covers:
*   **Landing App Frontend Application**
*   **Minecraft App Frontend Application**
*   **Minecraft Backend Application**
*   **Build System & Architecture**
*   **UI Component Library**

## 📄 License

This project is licensed under the MIT License. See the `LICENSE` file for details.

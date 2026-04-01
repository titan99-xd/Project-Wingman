#  Project Wingman

A modern Full-Stack application built with **TypeScript 6.0**, **React 19**, and **Node.js**. This project uses a monorepo-style structure to keep the frontend and backend organized in one place.

---

##  Project Structure

```text
Project-Wingman/
├── client/          # React + Vite Frontend
├── server/          # Node.js + Express Backend
├── package.json     # Root configuration (Concurrently)
└── .gitignore       # Root Git ignore rules
```


## Getting Started
Follow these steps to get the development environment running on your local machine.

1. Prerequisites
Node.js: v22.x or higher

npm: v10.x or higher

2. Installation
Clone the repository and install all dependencies for the root, client, and server:

Bash
# Clone the repo
git clone [https://github.com/titan99-xd/Project-Wingman.git](https://github.com/titan99-xd/Project-Wingman.git)
cd Project-Wingman

# Install Root dependencies
npm install

# Install Backend dependencies
cd server && npm install

# Install Frontend dependencies
cd ../client && npm install
3. Running the App
You don't need to open multiple terminals. Run the following command from the root folder to start both the backend and frontend simultaneously:

Bash
npm run dev
Frontend: http://localhost:5173

Backend: http://localhost:5000

🛠️ Tech Stack
Frontend
React 19: Modern UI library.

Vite: Ultra-fast build tool and dev server.

TypeScript 6.0: Strict type-safety.

Vite Proxy: Configured to forward /api requests to the backend.

Backend
Express 5.x: Minimalist web framework for Node.js.

ts-node-dev: Automatic server restarts on file changes.

ES Modules: Modern import/export syntax enabled via "type": "module".

🔧 Troubleshooting
TypeScript 6.0 Errors
If you see unexpected red lines in VS Code, ensure your editor is using the Workspace version of TypeScript:

Press Ctrl + Shift + P (or Cmd + Shift + P on Mac).

Type "TypeScript: Select TypeScript Version".

Choose "Use Workspace Version".

CORS Issues
The frontend is configured to use a proxy. Ensure your backend routes are called via /api/<route> from the React app to avoid cross-origin errors.


---

### Pro-tip for your GitHub:
Once you save this file, run these commands to update your repo so your coworker sees the new instructions immediately:

```bash
git add README.md
git commit -m "docs: add project readme and setup instructions"
git push origin main
```

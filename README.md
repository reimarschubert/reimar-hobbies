# TypeScript Playground

This is a minimal **Node-style TypeScript playground** for experimenting with TypeScript code, now with a simple **React + Vite** frontend.

## Structure

- `src/index.ts` – main entry file
- `tsconfig.json` – TypeScript compiler options
- `package.json` – project metadata and scripts

## How to use (Node console app)

1. **Install Node.js** (if you haven't yet) from the official website.
2. Open a terminal in this folder:  
   `cd "C:\Users\reima\OneDrive\Documents\ts-playground"`
3. Install dependencies:  
   `npm install`
4. Build the project:  
   `npx tsc`
5. Run the compiled JavaScript:  
   `node dist/index.js`

You can edit `src/index.ts` to try out any TypeScript code you like, then rebuild and run.

## How to use (React frontend)

1. Install dependencies (if you haven't already):  
   `npm install`
2. Start the Vite dev server:  
   `npm run dev`
3. Open your browser at the URL shown in the terminal (by default `http://localhost:5173`).  
4. Edit `src/App.tsx` or `src/main.tsx` and save to see live updates.



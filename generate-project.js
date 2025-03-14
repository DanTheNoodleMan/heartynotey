// generate-project.js
const fs = require('fs').promises;
const path = require('path');

const fileContents = {
  'package.json': `{
  "name": "love-notes-app",
  "version": "1.0.0",
  "description": "A cute desktop app for couples to share notes",
  "main": "dist/main/main.js",
  "scripts": {
    "start": "electron .",
    "dev": "concurrently \\"npm run dev:electron\\" \\"npm run dev:server\\"",
    "dev:electron": "webpack serve --config webpack.config.js",
    "dev:server": "ts-node-dev --respawn --transpile-only server/src/index.ts",
    "build": "webpack --config webpack.config.js && electron-builder",
    "build:server": "tsc -p server/tsconfig.json"
  }
}`,
  'tsconfig.json': `{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["dom", "es2020"],
    "jsx": "react",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "outDir": "./dist",
    "rootDir": "./src",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}`,
  'server/tsconfig.json': `{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "outDir": "../dist/server",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true
  }
}`,
  'src/main/main.ts': `import { app, BrowserWindow } from 'electron';
import path from 'path';

function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  win.loadFile('index.html');
}

app.whenReady().then(createWindow);`,
  'src/renderer/index.html': `<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8">
    <title>Love Notes</title>
    <link rel="stylesheet" href="styles/main.css">
  </head>
  <body>
    <div id="root"></div>
    <script src="index.js"></script>
  </body>
</html>`,
  'server/src/index.ts': `import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer);

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  console.log(\`Server running on port \${PORT}\`);
});`
};

const projectStructure = {
  'package.json': fileContents['package.json'],
  'tsconfig.json': fileContents['tsconfig.json'],
  'webpack.config.js': '',
  '.env': '',
  'src': {
    'main': {
      'main.ts': fileContents['src/main/main.ts'],
      'preload.ts': '',
      'ipc.ts': ''
    },
    'renderer': {
      'index.html': fileContents['src/renderer/index.html'],
      'note.html': '',
      'components': {
        'App.tsx': '',
        'MessageSender.tsx': '',
        'DrawingCanvas.tsx': '',
        'StickerPicker.tsx': '',
        'NoteWindow.tsx': ''
      },
      'styles': {
        'main.css': ''
      },
      'utils': {
        'websocket.ts': '',
        'types.ts': ''
      }
    }
  },
  'server': {
    'src': {
      'index.ts': fileContents['server/src/index.ts'],
      'routes': {
        'api.ts': ''
      },
      'websocket': {
        'handlers.ts': '',
        'types.ts': ''
      },
      'utils': {
        'logger.ts': ''
      }
    },
    'tsconfig.json': fileContents['server/tsconfig.json']
  },
  'dist': {}
};

async function createDirectory(basePath, structure) {
  for (const [name, content] of Object.entries(structure)) {
    const fullPath = path.join(basePath, name);
    
    if (typeof content === 'object') {
      await fs.mkdir(fullPath, { recursive: true });
      await createDirectory(fullPath, content);
    } else {
      await fs.writeFile(fullPath, content || '');
    }
  }
}

async function generateProject() {
  const projectName = 'love-notes-app';
  const projectPath = path.join(process.cwd(), projectName);

  try {
    await fs.mkdir(projectPath, { recursive: true });
    await createDirectory(projectPath, projectStructure);
    
    console.log('Project structure created successfully!');
    console.log(`Created in: ${projectPath}`);
    console.log('\nNext steps:');
    console.log('1. cd love-notes-app');
    console.log('2. npm install');
    console.log('3. npm run dev');
  } catch (error) {
    console.error('Error creating project structure:', error);
  }
}

generateProject();
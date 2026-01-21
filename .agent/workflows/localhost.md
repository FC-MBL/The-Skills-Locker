---
description: Close all active locally hosted projects and reopen the current one
---

# Reset Localhost

This workflow closes running Node processes and starts the dev server for the current project.

## Steps

### 1. Close existing Node processes
This ensures we don't have conflicting processes locking ports.
```powershell
taskkill /F /IM node.exe
```

### 2. Start the development server
// turbo
```powershell
npm run dev
```

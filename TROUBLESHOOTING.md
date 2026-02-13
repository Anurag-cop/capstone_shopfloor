# Troubleshooting Guide

This guide helps you resolve common issues you might encounter with the Shop Floor Resource Allocation System.

## Table of Contents

- [Installation Issues](#installation-issues)
- [Development Server Issues](#development-server-issues)
- [Build Issues](#build-issues)
- [Runtime Errors](#runtime-errors)
- [Performance Issues](#performance-issues)
- [Browser Compatibility](#browser-compatibility)
- [Common Error Messages](#common-error-messages)
- [Getting Help](#getting-help)

---

## Installation Issues

### npm install fails

**Problem:** Package installation fails or hangs

**Solutions:**

1. **Clear npm cache:**
```bash
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

2. **Check Node.js version:**
```bash
node --version  # Should be 18.x or higher
npm --version   # Should be 9.x or higher
```

3. **Use specific registry:**
```bash
npm install --registry https://registry.npmjs.org/
```

4. **Check network connectivity:**
```bash
npm config set proxy null
npm config set https-proxy null
```

### Permission errors (EACCES)

**Problem:** Permission denied when installing packages

**Solution (Linux/macOS):**
```bash
sudo chown -R $(whoami) ~/.npm
sudo chown -R $(whoami) /usr/local/lib/node_modules
```

**Solution (Windows):**
- Run terminal as Administrator
- Or change npm's default directory: [npm docs](https://docs.npmjs.com/resolving-eacces-permissions-errors-when-installing-packages-globally)

### Peer dependency warnings

**Problem:** Warnings about peer dependencies

**Solution:**
```bash
npm install --legacy-peer-deps
```

---

## Development Server Issues

### Port 3000 already in use

**Problem:** `Error: listen EADDRINUSE: address already in use :::3000`

**Solutions:**

**Windows:**
```powershell
# Find process using port 3000
netstat -ano | findstr :3000

# Kill the process (replace PID with actual process ID)
taskkill /PID <PID> /F
```

**macOS/Linux:**
```bash
# Find and kill process on port 3000
lsof -ti:3000 | xargs kill -9
```

**Or use a different port:**
```bash
npm run dev -- --port 3001
```

### Server starts but page doesn't load

**Problem:** Browser shows "This site can't be reached"

**Solutions:**

1. **Check if server is actually running:**
```bash
curl http://localhost:3000
```

2. **Try different browser**

3. **Check firewall settings** - Allow Node.js through firewall

4. **Clear browser cache:**
- Chrome: Ctrl+Shift+Delete
- Firefox: Ctrl+Shift+Delete
- Safari: Cmd+Option+E

### Hot Module Replacement (HMR) not working

**Problem:** Changes don't reflect without manual refresh

**Solutions:**

1. **Restart dev server:**
```bash
# Ctrl+C to stop, then
npm run dev
```

2. **Check file watchers limit (Linux):**
```bash
echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf
sudo sysctl -p
```

3. **Verify vite.config.ts:**
```typescript
export default defineConfig({
  server: {
    watch: {
      usePolling: true  // Add this if needed
    }
  }
})
```

---

## Build Issues

### TypeScript errors during build

**Problem:** `npm run build` fails with TypeScript errors

**Solutions:**

1. **Check TypeScript version:**
```bash
npm list typescript
```

2. **Run type checker separately:**
```bash
npm run type-check
```

3. **Fix type errors one by one:**
- Look for `any` types
- Check interface implementations
- Verify import paths

4. **Regenerate lock file:**
```bash
rm package-lock.json
npm install
```

### Vite build fails - Out of memory

**Problem:** `JavaScript heap out of memory`

**Solutions:**

1. **Increase Node.js memory:**
```bash
# Windows
set NODE_OPTIONS=--max_old_space_size=4096
npm run build

# macOS/Linux
NODE_OPTIONS=--max_old_space_size=4096 npm run build
```

2. **Add to package.json permanently:**
```json
{
  "scripts": {
    "build": "NODE_OPTIONS=--max_old_space_size=4096 vite build"
  }
}
```

### Import path errors

**Problem:** `Cannot find module '@/components/...'`

**Solution:**

1. **Verify tsconfig.json:**
```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

2. **Verify vite.config.ts:**
```typescript
import path from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  }
})
```

---

## Runtime Errors

### White screen / Blank page

**Problem:** Application loads but shows nothing

**Solutions:**

1. **Check browser console** (F12) for errors

2. **Check index.html:**
```html
<div id="root"></div>
```

3. **Check main.tsx:**
```typescript
ReactDOM.createRoot(document.getElementById('root')!)
```

4. **Verify App.tsx exports:**
```typescript
export default App;  // Not just 'export const App'
```

### Drag and Drop not working

**Problem:** Can't drag operators/machines to work orders

**Solutions:**

1. **Check DnD Provider in App.tsx:**
```typescript
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

<DndProvider backend={HTML5Backend}>
  <Dashboard />
</DndProvider>
```

2. **Verify useDrag/useDrop hooks:**
- Check `type` matches between drag and drop
- Ensure `collect` function returns correct props

3. **Check browser compatibility:**
- Drag and drop requires modern browsers
- Try Chrome/Firefox/Safari latest versions

### State not updating

**Problem:** Changes don't reflect in UI

**Solutions:**

1. **Check Zustand store selectors:**
```typescript
// ✅ Good: Use selector
const operators = useStore(state => state.operators);

// ❌ Bad: Select entire state
const store = useStore();
```

2. **Verify immutable updates:**
```typescript
// ✅ Good: Create new array
set(state => ({ items: [...state.items, newItem] }))

// ❌ Bad: Mutate array
set(state => { state.items.push(newItem); return state; })
```

3. **Check React re-renders:**
- Use React DevTools
- Check if component is memoized incorrectly

### Icons not displaying

**Problem:** Lucide icons show as empty boxes

**Solutions:**

1. **Verify import:**
```typescript
import { Users, Activity } from 'lucide-react';
```

2. **Check icon usage:**
```typescript
<Users size={20} />  // Not <Users />
```

3. **Reinstall lucide-react:**
```bash
npm uninstall lucide-react
npm install lucide-react
```

---

## Performance Issues

### Slow initial load

**Problem:** Application takes long to load

**Solutions:**

1. **Analyze bundle size:**
```bash
npm run build
# Check dist/ folder size
```

2. **Implement code splitting:**
```typescript
const Dashboard = lazy(() => import('./features/dashboard/Dashboard'));
```

3. **Check network tab** in DevTools:
- Look for large files
- Check for unnecessary requests

### Lag during drag and drop

**Problem:** Dragging feels slow or choppy

**Solutions:**

1. **Optimize render performance:**
```typescript
const MemoizedComponent = React.memo(Component);
```

2. **Use useCallback for handlers:**
```typescript
const handleDrop = useCallback((item) => {
  // handler logic
}, [dependencies]);
```

3. **Check browser extensions:**
- Disable extensions temporarily
- Test in incognito mode

### High memory usage

**Problem:** Browser tab consumes too much memory

**Solutions:**

1. **Check for memory leaks:**
- Open Performance tab in DevTools
- Take heap snapshots

2. **Clean up effects:**
```typescript
useEffect(() => {
  const timer = setInterval(() => {}, 1000);
  
  return () => clearInterval(timer);  // Cleanup
}, []);
```

3. **Limit rendered items:**
- Implement virtual scrolling
- Paginate large lists

---

## Browser Compatibility

### Safari specific issues

**Problem:** Works in Chrome but not Safari

**Solutions:**

1. **Check CSS compatibility:**
- Avoid `-webkit-` prefixes if possible
- Test flexbox/grid layouts

2. **Check JavaScript features:**
- Avoid very new ES features
- Vite should handle transpilation

3. **Test on actual Safari:**
- Simulators may not match real behavior

### Internet Explorer issues

**Problem:** Application doesn't work in IE

**Solution:**

**This application does NOT support Internet Explorer.** 

Minimum browser versions:
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

---

## Common Error Messages

### `Cannot read property 'X' of undefined`

**Cause:** Accessing property on undefined object

**Fix:**
```typescript
// ✅ Use optional chaining
const name = operator?.name ?? 'Unknown';

// ✅ Check before accessing
if (operator && operator.name) {
  console.log(operator.name);
}
```

### `Maximum update depth exceeded`

**Cause:** Infinite render loop

**Fix:**
```typescript
// ❌ Bad: Updates state on every render
const [count, setCount] = useState(0);
setCount(count + 1);  // Don't do this

// ✅ Good: Update in event handler or effect
useEffect(() => {
  setCount(count + 1);
}, [dependency]);
```

### `401 Unauthorized` or `403 Forbidden`

**Cause:** API authentication issues

**Fix:**
1. Check `.env` file has correct API keys
2. Verify token is being sent in headers
3. Check token expiration
4. If using mock data, ensure `VITE_ENABLE_MOCK_DATA=true`

### `Module not found: Can't resolve ...`

**Cause:** Import path error

**Fix:**
1. Check file exists at specified path
2. Verify file extension (.ts/.tsx)
3. Check case sensitivity (Windows vs Linux)
4. Rebuild project: `rm -rf node_modules && npm install`

---

## Getting Help

### Before asking for help:

1. **Search existing issues** on GitHub
2. **Check this troubleshooting guide**
3. **Read error messages carefully**
4. **Check browser console** (F12)
5. **Try in incognito mode** (eliminates extension issues)

### When reporting an issue:

Include:
- **Error message** (full stack trace)
- **Steps to reproduce**
- **Expected vs actual behavior**
- **Environment info:**
  ```bash
  node --version
  npm --version
  # OS and browser version
  ```
- **Screenshots** if applicable
- **Relevant code snippet**

### Useful debugging commands:

```bash
# Check all versions
npm list

# Verify build output
npm run build && npm run preview

# Run with verbose logging
npm run dev -- --debug

# Check TypeScript compilation
npx tsc --noEmit --listFiles
```

### VS Code debugging:

1. Add to `.vscode/launch.json`:
```json
{
  "type": "chrome",
  "request": "launch",
  "name": "Launch Chrome",
  "url": "http://localhost:3000",
  "webRoot": "${workspaceFolder}/src"
}
```

2. Press F5 to start debugging
3. Set breakpoints in VS Code

---

## Still having issues?

- **GitHub Issues:** Create a new issue with details
- **Discussions:** Ask questions in GitHub Discussions
- **Documentation:** Review [README.md](README.md) and [ARCHITECTURE.md](ARCHITECTURE.md)

---

**Last Updated:** 2024

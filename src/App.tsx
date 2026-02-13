import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import Dashboard from '@/features/dashboard/Dashboard';
import '@/styles/global.css';

function App() {
  return (
    <DndProvider backend={HTML5Backend}>
      <Dashboard />
    </DndProvider>
  );
}

export default App;

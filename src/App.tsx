import BehaviorGenerator from './view/BehaviorGenerator';
import { ThemeProvider } from './contexts/ThemeContext';

function App() {
  return (
    <ThemeProvider defaultTheme='dark' storageKey='grade-generator-theme'>
      <div className='min-h-screen bg-background text-foreground transition-colors'>
        <BehaviorGenerator />
      </div>
    </ThemeProvider>
  );
}

export default App;

import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import '../src/App.css';
import Chatbot from './components/Chatbot';
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Chatbot />} />
      </Routes>
    </Router>
  );
}
export default App;
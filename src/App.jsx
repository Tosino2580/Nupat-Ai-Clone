import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MainPage from './components/MainPage';
import AuthPage from './components/AuthPage'; // <-- Import AuthPage

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* After login */}
        <Route path="/" element={<MainPage />} />
        {/* All authentication (login + register switching) */}
        <Route path="/auth" element={<AuthPage />} />



      </Routes>
    </BrowserRouter>
  );
}

export default App;

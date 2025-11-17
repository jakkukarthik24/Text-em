
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import './css/App.css'
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Chat from './pages/Chat';
import AuthRedirect from './components/AuthRedirect';
function App() {
  
  return (
    <Routes>
      <Route path="/" element={<AuthRedirect />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/chat" element={<Chat />} />
    </Routes>
  )
}

export default App

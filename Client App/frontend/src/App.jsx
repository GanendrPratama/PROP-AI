import { Routes, Route, Navigate } from 'react-router-dom'
import Home from './pages/Home'
import Calculation from './pages/Calculation'
import Result from './pages/Result'
import Login from './pages/Login'
import Register from './pages/Register'
import './App.css'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/calculation" element={<Calculation />} />
      <Route path="/result" element={<Result />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  )
}

export default App

import { Routes, Route, Navigate } from 'react-router-dom'
import Home from './pages/Home'
import Calculation from './pages/Calculation'
import Result from './pages/Result'
import Login from './pages/Login'
import Register from './pages/Register'
import CreateListing from './pages/CreateListing'
import MyListings from './pages/MyListings'
import Listings from './pages/Listings'
import './App.css'

const isLoggedIn = () => {
  try {
    return !!localStorage.getItem('propai:user')
  } catch {
    return false
  }
}

const Protected = ({ children }) => {
  if (!isLoggedIn()) return <Navigate to="/login" replace />
  return children
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/calculation" element={<Calculation />} />
      <Route path="/result" element={<Result />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/listings" element={<Protected><Listings /></Protected>} />
      <Route path="/create-listing" element={<Protected><CreateListing /></Protected>} />
      <Route path="/my-listings" element={<Protected><MyListings /></Protected>} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  )
}

export default App

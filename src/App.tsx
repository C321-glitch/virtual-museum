import { Routes, Route } from 'react-router-dom'
import MainHome from './pages/MainHome'
import AdminLogin from './pages/AdminLogin'
import AdminPanel from './pages/AdminPanel'
import Collection from './pages/Collection'
import Exhibit from './pages/Exhibit'
import AdminExhibit from './pages/AdminExhibit'
import AdminCollection from './pages/AdminCollection'
import AllExhibits from './pages/AllExhibits'
import { Scanner } from './pages/Scanner';

export default function App() {
    return (
    <Routes>
        <Route path="/" element={<MainHome />} />
        <Route path="/scanner" element={<Scanner />} />
        <Route path="/collection/:id" element={<Collection />} />
        <Route path="/exhibit/:id" element={<Exhibit />} />
        <Route path="/allexhibits" element={<AllExhibits />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/collection/:id" element={<AdminCollection />} />
        <Route path="/admin/exhibit/:id" element={<AdminExhibit />} />
        <Route path="/admin" element={<AdminPanel />} />
    </Routes>
    )
}
import { Outlet } from 'react-router-dom'
import Header from '../components/Header'

export default function Layout() {
  return (
    <div className="min-h-screen">
      <Header />
      <Outlet />
      <footer className="py-10 text-center">
        <p className="text-[11px] text-black/15">Dialed by H &middot; Content Agent</p>
      </footer>
    </div>
  )
}

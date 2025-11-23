import { Outlet } from 'react-router-dom'
import Header from './Header'
import Footer from './Footer'

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen bg-dark-900">
      <Header />
      <main>
        {children || <Outlet />}
      </main>
      <Footer />
    </div>
  )
}

export default Layout

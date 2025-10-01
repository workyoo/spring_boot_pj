import React from 'react'
import Header from '../layout/Header'
import Footer from '../layout/Footer'
import Menu from '../layout/Menu'
import { Outlet } from 'react-router-dom'

const MainLayout = () => {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      width: '100%',
      maxWidth: '100%'
    }}>
      <Header />
      <Menu />
      <main style={{
        flex: 1,
        width: '100%',
        maxWidth: '100%',
        minHeight: 'calc(100vh - 200px)',
        padding: '0'
      }}>
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}

export default MainLayout

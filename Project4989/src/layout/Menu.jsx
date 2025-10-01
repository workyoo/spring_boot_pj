import React from 'react'
import { Link } from 'react-router-dom'
import './Menu.css'

const Menu = () => {
  return (      
    <nav className="menu-nav">
      <ul className="menu-list">
        <li className="menu-item">
          <Link to="/goods" className="menu-link">
            중고거래
          </Link>
        </li>
        <li className="menu-item">
          <Link to="/cars" className="menu-link">
            자동차
          </Link>
        </li>
        <li className="menu-item">
          <Link to="/real-estate" className="menu-link">
            부동산
          </Link>
        </li>
        <li className="menu-item">
          <Link to="/auction" className="menu-link">
            경매
          </Link>
        </li>
      </ul>
    </nav>
  )
}

export default Menu

import React from 'react'
import { NavLink } from 'react-router-dom';

function Header() {
  return (
    <header className="header">
      <div className="header__links">
        <NavLink activeClassName="selected" to="/transport">Транспортна</NavLink>
        <NavLink activeClassName="selected" to="/" exact>Сімплексна</NavLink>
        <NavLink activeClassName="selected" to="/destiny" exact>Призначення</NavLink>
      </div>
      <p className="header__title">Вирішуй задачі по максимізації прибутку онлайн!</p>
      <small style={{fontSize:'10px'}}>by Maksym Solodovnykov</small>
    </header>
  )
}

export default Header

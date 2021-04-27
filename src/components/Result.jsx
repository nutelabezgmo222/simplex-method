import React from 'react'

function Result({ resultSet = {}, values = [] }) {
  return (
    <div className="result">
      <h3>Результат</h3>
      <div className="result__body">
        Для того щоб отримати максимальный прибуток у вигляді {Math.floor(resultSet.finalValue)} у.о
        <p>Необхідно створити:</p>
        <ul className="result__list">
          {
            resultSet.variables &&
            resultSet.variables.map((variable, i) => {
              if (typeof variable.name === 'number') {
                return <li key={i}>{values[variable.name].title} : {Math.floor(variable.value)}</li>
              }
              return '';
            })
          }
        </ul>
      </div>
      
    </div>
  )
}

export default Result

import React from 'react'

function Result({ resultSet = {}, values = [], attributes=[] }) {
  const finalValue = resultSet.variables.reduce((total, variable) => {
    if (variable.name < values.length) {
      total += values[variable.name].prodValues[0].value * variable.value
    }
    return total;
  }, 0)
  const materials = attributes.reduce((arr, attr) => {
    if (attr.id === 0) return arr;
    const curBalance = resultSet.variables.reduce((total, variable) => {
      if (variable.name < values.length) {
        total +=
          values[variable.name].prodValues.find((prodVal) => prodVal.id === attr.id).value *
          variable.value
      }
      return total;
    }, 0)
    arr.push({ name: attr.title, balance: attr.restriction - curBalance });
    return arr;
  }, [])
  return (
    <div className="result">
      <h3>Результат</h3>
      <div className="result__body">
        Для того щоб отримати максимальный прибуток у вигляді
        <span style={{fontSize:'1.2em', color: 'darkgreen', fontWeight: 'bold'}}> {finalValue}</span> у.о
        <p>Необхідно створити:</p>
        <ul className="result__list">
          {
            resultSet &&
            resultSet.variables.map((variable, i) => {
              if (typeof variable.name === 'number') {
                if (variable.name < values.length) {
                  return <li key={i}>{values[variable.name].title} : {variable.value}</li>
                }
              }
              return '';
            })
          }
        </ul>
        <p style={{marginTop: '15px'}}>Залишки матеріалів:</p>
        <ul className="result__list">
          {
            materials &&
            materials.map((material, i) => {
              return <li key={`${material.name}_${i}`}>{material.name} : {material.balance}</li>
            })
          }
        </ul>
      </div>
      
    </div>
  )
}

export default Result

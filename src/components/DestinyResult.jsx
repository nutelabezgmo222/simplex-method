import React from 'react'

function DestinyResult({ prod, results }) {
  let str = "";
  let sum = 0;
  return (
    <div className="destiny-result">
      <h2>Отримано оптимальну матрицю призначень</h2>
      <table>
        <thead>
          <tr>
            <td></td>
            <td></td>
            <td colSpan={prod.values.length}>Види робіт</td>
          </tr>
          <tr>
            <td></td>
            <td></td>
            {
              prod.values.map(val => {
                return <td key={val.title}>{val.title}</td>
              })
            }
          </tr>
        </thead>
        <tbody>
        {
          results.usedMatrix.map((row, i) => {
            return i === 0 ? (
              <tr key={i}>
                <td rowSpan={results.usedMatrix.length}>Виконавці</td>
                <td>{prod.attributes[i].title}</td>
                {
                  row.map((item, i) => {
                    return <td key={i}>{ item === 1 ? item  : ""}</td>
                  })
                }
              </tr>
            ): (
                <tr>
                  <td>{prod.attributes[i].title}</td>
                  {
                    row.map((item, i) => {
                      return <td key={i}>{ item === 1 ? item  : ""}</td>
                    })
                  }
              </tr>
            )
          })
        }
        </tbody>
      </table>
      <h2>Яка відповідає початковій таблиці витрат</h2>
      <table>
        <tr>
          <td></td>
          <td></td>
          <td colSpan={prod.values.length}>Види робіт</td>
        </tr>
        <tr>
          <td></td>
          <td></td>
          {
            prod.values.map(val => {
              return <td key={val.title}>{val.title}</td>
            })
          }
        </tr>
        {
          results.startMatrix.map((row, i) => {
            return i === 0 ? (
              <tr key={i}>
                <td rowSpan={results.startMatrix.length}>Виконавці</td>
                <td>{prod.attributes[i].title}</td>
                {
                  row.map((item, j) => {
                    return <td key={j} className={results.usedMatrix[i][j] === 1 ? "active" : ""}>{ item }</td>
                  })
                }
              </tr>
            ): (
                <tr>
                  <td>{prod.attributes[i].title}</td>
                  {
                    row.map((item, j) => {
                      return <td key={j} className={results.usedMatrix[i][j] === 1 ? "active" : ""}>{ item }</td>
                    })
                  }
              </tr>
            )
          })
        }
      </table>
      <h2>Загальні витрати складають:</h2>
      <p>
        {
          results.usedMatrix.forEach((row, i) => {
            row.forEach((el, j) => {
              if (el === 1) {
                if (str.length) {
                  str += " + ";
                }
                str += ""+results.startMatrix[i][j];
                sum += +results.startMatrix[i][j];
              }
            })
          })
        }
        {str} = {sum}
      </p>
    </div>
  )
}

export default DestinyResult

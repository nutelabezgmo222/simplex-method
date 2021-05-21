import React from 'react'

function TransportResults({ results, prod }) {
  console.log(prod);
  return (
    <div className="transport-resulst">
      {
        results.map(plan => {
          return (
            <div style={{margin: "10px"}}>
              <table>
                <tr>
                  <td></td>
                  <td></td>
                {prod.values.map(val => {
                  return <td>{val.title}</td>
                })}
                </tr>
                <tr>
                <td></td>
                <td></td>
                {prod.values.map(val => {
                  return <td>{val.prodValues[0].value}</td>
                })}
                </tr>
                {plan.logPlan.map((row, i) => {
                  return (<tr>
                    <td>{prod.attributes[i + 1].title}</td>
                    <td>{prod.attributes[i + 1].restriction}</td>
                    {row.map(val => {
                      return <td>{val}</td>
                    })}
                  </tr>)
                })}
              </table>
              <p>Goal function = {plan.logGoalFunction}</p>
            </div>
          )
        })
      }
    </div>
  )
}

export default TransportResults

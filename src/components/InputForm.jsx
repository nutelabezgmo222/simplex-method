import React from 'react'

function InputForm({ products, inputTypes, onRowAdd = f => f,
  onColumnAdd = f => f, onInputBlur = f => f, onRowRemove=f=>f, onColumnRemove=f=>f }) {
  const { attributes, values } = products;
  
  const checkForNumber = (e) => {
    let str = e.target.value;
    if (isNaN(str[str.length - 1])) {
      str = str.slice(0, str.length - 1);
      e.target.value = str;
    }
  }
  return (
    <form className="start-form">
      <div className="start-form__attributes">
        {
          attributes &&
          attributes.map((attr) => {
            return (
              <div key={attr.id} className="start-form__attribute">
                 {attr.id === 0 ? '' : 
                  <svg
                    onClick={() => onRowRemove(attr.id)}
                    className="minus-sign"
                    viewBox="0 0 512 512"
                    xmlns="http://www.w3.org/2000/svg">
                    <path d="m256 512c-141.164062 0-256-114.835938-256-256s114.835938-256 256-256 256 114.835938 256 256-114.835938 256-256 256zm0-480c-123.519531 0-224 100.480469-224 224s100.480469 224 224 224 224-100.480469 224-224-100.480469-224-224-224zm0 0" />
                    <path d="m368 272h-224c-8.832031 0-16-7.167969-16-16s7.167969-16 16-16h224c8.832031 0 16 7.167969 16 16s-7.167969 16-16 16zm0 0" />
                  </svg>
                  }
                <input
                  key={attr.id}
                  onBlur={(e)=>onInputBlur(e, attr.id, inputTypes.ATTRIBUTE)}
                  type="text" defaultValue={attr.value}
                  placeholder="Введіть назву атрибута" />
              </div>)
          })
        }
        <svg onClick={onRowAdd} className="plus-sign" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
          <path d="m256 512c-141.164062 0-256-114.835938-256-256s114.835938-256 256-256 256 114.835938 256 256-114.835938 256-256 256zm0-480c-123.519531 0-224 100.480469-224 224s100.480469 224 224 224 224-100.480469 224-224-100.480469-224-224-224zm0 0" />
          <path d="m368 272h-224c-8.832031 0-16-7.167969-16-16s7.167969-16 16-16h224c8.832031 0 16 7.167969 16 16s-7.167969 16-16 16zm0 0" />
          <path d="m256 384c-8.832031 0-16-7.167969-16-16v-224c0-8.832031 7.167969-16 16-16s16 7.167969 16 16v224c0 8.832031-7.167969 16-16 16zm0 0" />
        </svg>
      </div>
      <div className="start-form__values">
        {
          values &&
          values.map((value) => {
            return(
            <div key={value.id} className="start-form__value-col">
              <div className="start-form__value-header">
                  {value.id === 0 ? '' : 
                    <svg
                      onClick={() => onColumnRemove(value.id)}
                      className="minus-sign"
                      viewBox="0 0 512 512"
                      xmlns="http://www.w3.org/2000/svg">
                      <path d="m256 512c-141.164062 0-256-114.835938-256-256s114.835938-256 256-256 256 114.835938 256 256-114.835938 256-256 256zm0-480c-123.519531 0-224 100.480469-224 224s100.480469 224 224 224 224-100.480469 224-224-100.480469-224-224-224zm0 0" />
                      <path d="m368 272h-224c-8.832031 0-16-7.167969-16-16s7.167969-16 16-16h224c8.832031 0 16 7.167969 16 16s-7.167969 16-16 16zm0 0" />
                    </svg>
                  }
                  <input
                    onBlur={(e)=>onInputBlur(e, value.id, inputTypes.TITLE)}
                    type="text"
                    defaultValue={value.title}
                    placeholder="Введіть назву товару" />
              </div>
              <div className="start-form__value-body">
                  {
                    value.prodValues.map((prodVal) => {
                      return (
                        <input
                          onBlur={(e) => onInputBlur(e, value.id, inputTypes.VALUE, prodVal.id)}
                          onChange={checkForNumber}
                          key={prodVal.id}
                          type="text"
                          defaultValue={prodVal.value}
                          placeholder="Введіть кількість"/>
                      )
                    })
                  }
              </div>
            </div>)
          })
        }
        <svg onClick={onColumnAdd} className="plus-sign" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
          <path d="m256 512c-141.164062 0-256-114.835938-256-256s114.835938-256 256-256 256 114.835938 256 256-114.835938 256-256 256zm0-480c-123.519531 0-224 100.480469-224 224s100.480469 224 224 224 224-100.480469 224-224-100.480469-224-224-224zm0 0" />
          <path d="m368 272h-224c-8.832031 0-16-7.167969-16-16s7.167969-16 16-16h224c8.832031 0 16 7.167969 16 16s-7.167969 16-16 16zm0 0" />
          <path d="m256 384c-8.832031 0-16-7.167969-16-16v-224c0-8.832031 7.167969-16 16-16s16 7.167969 16 16v224c0 8.832031-7.167969 16-16 16zm0 0" />
        </svg>
      </div>
    </form>
  )
}

export default InputForm

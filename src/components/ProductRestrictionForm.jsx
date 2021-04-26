import React from 'react'
import { signs } from '../constants';

function ProductRestrictionForm({ products = [], prodRestriction = [],
  onProdRestAdd = f => f, onProdRestChange=f=>f, onProdRestRemove=f=>f}) {
  return (
    <div className="prod-rest">
      <p className="prod-rest__title">Задайте тут обмеження на виробництво</p>
      <div className="prod-rest__restriction-list">
         {
          prodRestriction.map((rest) => 
            <div key={rest.id} className="prod-rest__restriction-box">
              <select onChange={(e) => onProdRestChange(e, rest.id)} name="prodId">
                <option key={''} value={''}>оберіть товар</option>
                {products &&
                  products.map((product) =>
                    <option key={product.id} value={product.id}>{product.title}</option>
                )}
              </select>
              <select onChange={(e)=>onProdRestChange(e, rest.id)} name="sign">
                {
                  signs.map((sign) => 
                    <option key={sign.value} value={sign.value}>{sign.sign}</option>
                  )
                }
              </select>
              <input
                type="text"
                name="value"
                defaultValue={rest.value}
                onBlur={(e) => onProdRestChange(e, rest.id)} />
              <svg
                onClick={() => onProdRestRemove(rest.id)}
                className="minus-sign"
                viewBox="0 0 512 512"
                xmlns="http://www.w3.org/2000/svg">
                <path d="m256 512c-141.164062 0-256-114.835938-256-256s114.835938-256 256-256 256 114.835938 256 256-114.835938 256-256 256zm0-480c-123.519531 0-224 100.480469-224 224s100.480469 224 224 224 224-100.480469 224-224-100.480469-224-224-224zm0 0" />
                <path d="m368 272h-224c-8.832031 0-16-7.167969-16-16s7.167969-16 16-16h224c8.832031 0 16 7.167969 16 16s-7.167969 16-16 16zm0 0" />
              </svg>
          </div>
          )
        }
      </div>
      <svg onClick={onProdRestAdd} className="plus-sign" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
        <path d="m256 512c-141.164062 0-256-114.835938-256-256s114.835938-256 256-256 256 114.835938 256 256-114.835938 256-256 256zm0-480c-123.519531 0-224 100.480469-224 224s100.480469 224 224 224 224-100.480469 224-224-100.480469-224-224-224zm0 0" />
        <path d="m368 272h-224c-8.832031 0-16-7.167969-16-16s7.167969-16 16-16h224c8.832031 0 16 7.167969 16 16s-7.167969 16-16 16zm0 0" />
        <path d="m256 384c-8.832031 0-16-7.167969-16-16v-224c0-8.832031 7.167969-16 16-16s16 7.167969 16 16v224c0 8.832031-7.167969 16-16 16zm0 0" />
      </svg>
    </div>
  )
}

export default ProductRestrictionForm;

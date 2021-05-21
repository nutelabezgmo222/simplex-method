import React from 'react'
import { checkForNumber } from '../features/features.js'
import { inputTypes } from '../constants';
import { useLocation } from 'react-router-dom';

let inputField = {
  "/": {
    title: "Задайте тут обмеження по матеріалам",
    nonActive: 'Будь ласка вкажіть назви для матеріалів',
  },
  "/transport": {
    title: "Задайте тут запаси постачальників",
    nonActive: 'Будь ласка вкажіть назви для постачальників'
  }
}


function AttributesResctrictionForm({ attributes = [],onInputBlur=f=>f}) {
  let title;
  let activeAttributes = attributes.filter((attr) => attr.title.length && attr.id !== 0)
  let location = useLocation();
  if (attributes.length === 1) {
    title = ''
  } else if (!activeAttributes.length) {
    title = inputField[location.pathname].nonActive
  } else {
    title = inputField[location.pathname].title
  }
  
  return (
    <div className="attr-rest">
      <p className="attr-rest__title">{title}</p>
      {
        activeAttributes &&
        activeAttributes.map((attr) =>
          <div key={attr.id} className="attr-rest__attribute">
            <p>{attr.title}</p>
            <input
              onBlur={(e) => onInputBlur(e, attr.id, inputTypes.ATTR_REST)}
              onChange={checkForNumber}
              defaultValue={attr.restriction}
              type="text" />
          </div>)
      }
    </div>
  )
}

export default AttributesResctrictionForm

import React from 'react'
import { checkForNumber } from '../features/features.js'
import { inputTypes } from '../constants';

function AttributesResctrictionForm({ attributes = [],onInputBlur=f=>f}) {
  let title;
  let activeAttributes = attributes.filter((attr) => attr.title.length && attr.id !== 0)
  if (attributes.length === 1) {
    title = ''
  } else if (!activeAttributes.length) {
    title = 'Будь ласка вкажіть назви для матеріалів'
  } else {
    title = 'Задайте тут обмеження по матеріалам'
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
              type="text" />
          </div>)
      }
    </div>
  )
}

export default AttributesResctrictionForm

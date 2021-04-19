import './scss/app.scss';
import React from 'react';
import { Header, Main, InputForm } from './components';

function App() {
  const [prodObject, setProdObject] = React.useState(products);

  const onInputBlur = (e, id = 0, type = "", prodId = 0) => {
    switch (type) {
      case inputTypes.ATTRIBUTE: {
        const newAttributes = prodObject.attributes.map((attribute) => {
          return attribute.id === id ?
            {
              ...attribute,
              title: e.target.value
            } : attribute
        });
        setProdObject({
          ...prodObject,
          attributes: newAttributes,
        });
        break;
      }
      case inputTypes.TITLE: {
        const newValues= prodObject.values.map((value) => {
          return value.id === id
            ? {
                ...value,
                title: e.target.value,
              }
            : value;
        });
        setProdObject({
          ...prodObject,
          values: newValues,
        });
        break;
      }
      case inputTypes.VALUE: {
        const newValues = prodObject.values.map((value) => {
          if (value.id === id) {
            const newProdValues = value.prodValues.map((prodVal) =>
              prodVal.id === prodId ?
                { ...prodVal, value: e.target.value } :
                prodVal
            )
            return {
              ...value,
              prodValues: newProdValues
            }
          } else {
            return value;
          }
        });
        setProdObject({
          ...prodObject,
          values: newValues,
        });
        break;
      }
      default: {
        console.log('Something went wrong');
        return 0;
      }
    }
  };
  const handleColumnRemove = (id) => {
    const newValues = prodObject.values.filter((value) => value.id !== id);
    setProdObject({ ...prodObject, values: newValues });
  }
  const handleColumnAdd = () => {
    const newProdValues = prodObject.attributes.map((attr) => {
      return {
        id: attr.id,
        value: ''
      }
    })
    const newValues = [
      ...prodObject.values,
      {
        id: (Math.random() * 1e18).toString(26),
        title: "",
        prodValues: newProdValues
      },
    ];
    setProdObject({
      ...prodObject,
      values: newValues
    })
  }
  
  const handleRowRemove = (id) => {
    const newAttributes = prodObject.attributes.filter((attr) => attr.id !== id);
    const newValues = prodObject.values.map((value) => {
      const newProdValues = value.prodValues.filter((prodVal) => prodVal.id !== id);
      return { ...value, prodValues: newProdValues };
    });
    setProdObject({ attributes: newAttributes, values: newValues });
  };
  
  const handleRowAdd = () => {
    const newAttribute = {
      id: (Math.random() * 1e18).toString(26),
      title: "",
      meassurement: "",
    };
    const newAttributes = [...prodObject.attributes, newAttribute];
    const newValues = prodObject.values.map((value) => {
      const newProdValues = [...value.prodValues, { id: newAttribute.id, value: '' }]
      return {...value, prodValues: newProdValues}
    })
    setProdObject({ attributes: newAttributes, values: newValues });
  }
  return (
    <div className="app">
      <Header></Header>
      <Main>
        <InputForm
          products={prodObject}
          onInputBlur={onInputBlur}
          inputTypes={inputTypes}
          onColumnAdd={handleColumnAdd}
          onColumnRemove={handleColumnRemove}
          onRowAdd={handleRowAdd}
          onRowRemove={handleRowRemove}
        />
      </Main>
    </div>
  );
}

const products = {
  attributes: [
    {
      id: 0,
      title: '',
      meassurement: ''
    }
  ],
  values: [
    {
      id: 0,
      title: '',
      prodValues: [
        {id: 0, value: ''}
      ]
    }
  ]
}

const inputTypes = {
  ATTRIBUTE: 'attributes',
  TITLE: 'title',
  VALUE: 'value',
}

export default App;

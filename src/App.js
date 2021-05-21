import './scss/app.scss';
import React from 'react';
import {
  Header,
  Main,
  InputForm,
  AttributesResctrictionForm,
  ProductRestrictionForm,
  Result,
  TransportResults,
} from "./components";
import { inputTypes, products, transport } from './constants';
import { Switch, Route, useLocation } from 'react-router-dom';
import Simplex from './features/simplex-core.js';
import Transport from "./features/transport-core.js";

function App() {
  const [prodObject, setProdObject] = React.useState({});
  const [prodRestriction, setProdRestriction] = React.useState([]);
  const [result, setResult] = React.useState(null);
  const [transportResults, setTransportResults] = React.useState(null);
  const location = useLocation();

  React.useEffect(() => {
    switch (location.pathname) {
      case "/": {
        setProdObject(products);
        break;
      }
      case "/transport": {
        setProdObject(transport);
        break;
      }
      default: {
        break;
      }
    }
  }, [location.pathname]);
  
  const onInputBlur = (e, id = 0, type = "", prodId = 0) => {
    switch (type) {
      case inputTypes.ATTRIBUTE: {
        const newAttributes = prodObject.attributes.map((attribute) => {
          return attribute.id === id
            ? {
                ...attribute,
                title: e.target.value,
              }
            : attribute;
        });
        setProdObject({
          ...prodObject,
          attributes: newAttributes,
        });
        break;
      }
      case inputTypes.TITLE: {
        const newValues = prodObject.values.map((value) => {
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
              prodVal.id === prodId
                ? { ...prodVal, value: e.target.value }
                : prodVal
            );
            return {
              ...value,
              prodValues: newProdValues,
            };
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
      case inputTypes.ATTR_REST: {
        const newAttributes = prodObject.attributes.map((attr) =>
          attr.id === id ? { ...attr, restriction: e.target.value } : attr
        );;
        setProdObject({...prodObject, attributes: newAttributes});
        break;
      }
      default: {
        console.log("Something went wrong");
        return 0;
      }
    }
  };

  const handleColumnRemove = (id) => {
    const newValues = prodObject.values.filter((value) => value.id !== id);
    setProdObject({ ...prodObject, values: newValues });
  };
  const handleColumnAdd = () => {
    const newProdValues = prodObject.attributes.map((attr) => {
      return {
        id: attr.id,
        value: "",
      };
    });
    const newValues = [
      ...prodObject.values,
      {
        id: (Math.random() * 1e18).toString(26),
        title: "",
        prodValues: newProdValues,
      },
    ];
    setProdObject({
      ...prodObject,
      values: newValues,
    });
  };

  const handleRowRemove = (id) => {
    const newAttributes = prodObject.attributes.filter(
      (attr) => attr.id !== id
    );
    const newValues = prodObject.values.map((value) => {
      const newProdValues = value.prodValues.filter(
        (prodVal) => prodVal.id !== id
      );
      return { ...value, prodValues: newProdValues };
    });
    setProdObject({ attributes: newAttributes, values: newValues });
  };

  const handleRowAdd = () => {
    const newAttribute = {
      id: (Math.random() * 1e18).toString(26),
      title: "",
      restriction: "",
      meassurement: "",
    };
    const newAttributes = [...prodObject.attributes, newAttribute];
    const newValues = prodObject.values.map((value) => {
      const newProdValues = [
        ...value.prodValues,
        { id: newAttribute.id, value: "" },
      ];
      return { ...value, prodValues: newProdValues };
    });
    setProdObject({ attributes: newAttributes, values: newValues });
  };

  const onProdRestAdd = () => {
    setProdRestriction([
      ...prodRestriction,
      {
        id: (Math.random() * 1e18).toString(26),
        prodId: 0,
        sign: 0,
        restriction: ''
      }
    ])
  }
  const handleProdRestChange = (e, id) => {
    const target = e.target;
    const name = target.name;
    const value = target.value;
    const newProdRest = prodRestriction.map((rest) =>
      rest.id === id ? {...rest, [name]: value} : rest
    )
    setProdRestriction(newProdRest);
  }
  const handleProdRestRemove = (id) => {
    const newProdRest = prodRestriction.filter((rest) =>
      rest.id !== id
    );
    setProdRestriction(newProdRest);
  }
  const handleSimplexCalc = () => {
    const simplex = new Simplex(prodObject, prodRestriction);
    setResult({
      variables: simplex.getResult(),
    });
  }
  const handleTransportCalc = () => {
    const transport = new Transport(prodObject);
    setTransportResults(transport.logArray);
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
        <AttributesResctrictionForm
          attributes={prodObject.attributes}
          onInputBlur={onInputBlur}
        />
        <Switch>
          <Route path="/transport" exact>
            <div className="button-box">
              <button onClick={handleTransportCalc} className="main-button">
                Рохрахувати
              </button>
            </div>
            {
              transportResults &&
              <TransportResults prod={prodObject} results={transportResults}></TransportResults>
            }
          </Route>
          <Route path="/">
            <ProductRestrictionForm
              products={prodObject.values}
              prodRestriction={prodRestriction}
              onProdRestAdd={onProdRestAdd}
              onProdRestChange={handleProdRestChange}
              onProdRestRemove={handleProdRestRemove}
            />
            <div className="button-box">
              <button onClick={handleSimplexCalc} className="main-button">
                Рохрахувати
              </button>
            </div>
            {result && (
              <Result
                resultSet={result}
                values={prodObject.values}
                attributes={prodObject.attributes}
              />
            )}
          </Route>
        </Switch>
      </Main>
    </div>
  );
}



export default App;

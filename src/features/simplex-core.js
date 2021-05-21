class SimplexData {
  goalFunction = []; // arr of coefficients of goal function
  freeVariables = []; // arr of coefficients of all free variables
  coefRestSystem = []; // arr of coefficients of all restrictions
  signs = []; //arr from signs of each restriction where -1 is '<=' 0 is '=' and 1 is '>='
  numVar = 0; // start variables number
  numRest = 0; // start resctriction number
  way = true; // true -> max; false -> min

  constructor(object, prodRest = null) {
    this.setRestrictionNumber(object.attributes, prodRest);
    this.setVariablesNumber(object.values);
    this.setGoalFunction(object.values);
    this.setWayOfFunction(true);
    this.setRestrictionSystem(object.attributes, object.values, prodRest);
    this.setSigns(object.attributes);
    this.setFreeVariables(object.attributes, prodRest);
  }
  setRestrictionNumber(attributes, prodRest = null) {
    let numberOfRestrictions = attributes.length - 1;
    if (prodRest !== null) {
      numberOfRestrictions += prodRest.length;
    }
    this.numRest = numberOfRestrictions;
  }
  setVariablesNumber(values) {
    this.numVar = values.length;
  }
  setGoalFunction(values) {
    this.goalFunction = values.map((val) => val.prodValues[0].value);
  }
  setWayOfFunction(way) {
    this.way = way;
  }
  setRestrictionSystem(attributes, values, prodRest = null) {
    let prodRestArr, coefArr;
    coefArr = attributes.reduce((arr, attr) => {
      if (attr.id === 0) return arr;
      const newRow = values.map((val) => {
        return val.prodValues.filter((prodVal) => {
          return prodVal.id === attr.id;
        })[0].value;
      });
      arr.push(newRow);
      return arr;
    }, []);
    if (prodRest !== null) {
      prodRestArr = prodRest.map((rest) => {
        const newRow = values.map((val) => {
          return val.id.toString() === rest.prodId.toString() ? 1 : 0;
        });
        return newRow;
      });
      coefArr = coefArr.concat(prodRestArr);
    }
    this.coefRestSystem = coefArr;
  }
  setSigns(attributes) {
    this.signs = attributes.reduce((arr, attr) => {
      if (attr.id === 0) return arr;
      arr.push(-1); // temporary set <= for each restriction
      return arr;
    }, []);
  }
  setFreeVariables(attributes, prodRest = null) {
    let freeVariablesArr, prodRestVariables;
    freeVariablesArr = attributes.reduce((arr, attr) => {
      if (attr.id === 0) return arr;
      arr.push(attr.restriction);
      return arr;
    }, []);
    if (prodRest !== null) {
      prodRestVariables = prodRest.map((rest) => {
        return rest.restriction;
      })
      freeVariablesArr = freeVariablesArr.concat(prodRestVariables);
    }
    this.freeVariables = freeVariablesArr;
  }
}

export default class Simplex extends SimplexData {
  currentGoalValue = 0; // current decision goal function value
  basisValues = []; // current decision basis values
  coefMatrix = []; // current decision matrix
  indexRow = []; // last row of the matrix
  leadingColIndex = 0; // current decision leading col
  leadingRowIndex = 0; // current decision leading row
  leadingElement = 0; // current leading element (crossing of leading col and row)
  lastCol = [];
  itarationCount = 0;
  constructor(object, prodRest = null) {
    super(object, prodRest);
    this.iterationCount = 0;
    this.initSimplexTable();
    while (!this.isFunctionOptimal() && (this.iterationCount < 30)) {
      this.findOptimal();
      this.iterationCount++;
    }
  }
  
  initSimplexTable() {
    // matrix coefficients and identity matrix
    let currentIdentityIndex = 0;
    for (let i = 0; i < this.numRest; i++) {
      let currentRow = [];
      for (let j = 0; j < this.numVar; j++) {
        currentRow.push(this.coefRestSystem[i][j]);
      }
      let identityRow = new Array(this.numRest).fill(0);
      identityRow[currentIdentityIndex] = 1;
      currentIdentityIndex = currentIdentityIndex + 1;
      currentRow = currentRow.concat(identityRow);

      this.coefMatrix.push(currentRow);
    }

    // basis values
    for (let i = 0; i < this.numRest; i++) {
      let basisObj = {
        name: `x${this.numRest + i + 1}`,
        value: this.freeVariables[i],
      };
      this.basisValues.push(basisObj);
    }

    //index row
    let identityRow = new Array(this.numRest).fill(0);
    this.indexRow = this.goalFunction
      .map((item) => item * -1)
      .concat(identityRow);

    // leading column index
    this.findLeadingCol();
    // last column values
    this.setLastCol();
    // leading row index
    this.findLeadingRow();
    // leading element
    this.setLeadingElement();
  }

  isFunctionOptimal() {
    let negativeIndex = this.indexRow.findIndex((item) => item < 0);
    if (negativeIndex !== -1) {
      return false;
    }
    return true;
  }
  findLeadingCol() {
    let minIndex = 0;
    for (let i = 1; i < this.indexRow.length; i++) {
      if (this.indexRow[minIndex] > this.indexRow[i]) {
        minIndex = i;
      }
    }
    this.leadingColIndex = minIndex;
  }
  findLeadingRow() {
    try {
      let minElementId = null;
      for (let i = 0; i < this.lastCol.length; i++) {
        if (this.lastCol[i] !== null) {
          minElementId = i;
          break;
        } 
      }
      if (minElementId === null) {
        throw new Error("all basis is null");
      }
      for (let i = 0; i < this.lastCol.length; i++) {
        if (this.lastCol[i] !== null && this.lastCol[i] < this.lastCol[minElementId]) {
          minElementId = i;
        }
      }
      this.leadingRowIndex = minElementId;
    } catch (e) {
      console.error(e.message);
      this.leadingRowIndex = undefined;
    }
  }
  setLastCol() {
    this.lastCol = [];
    for (let i = 0; i < this.basisValues.length; i++) {
      let colValue;
      if (this.coefMatrix[i][this.leadingColIndex] <= 0) {
        colValue = null;
      } else {
        colValue =
          this.basisValues[i].value / this.coefMatrix[i][this.leadingColIndex];
        colValue = this.roundValue(colValue)
      }
      this.lastCol.push(colValue);
    }
  }
  setLeadingElement() {
    this.leadingElement = this.coefMatrix[this.leadingRowIndex][
      this.leadingColIndex
    ];
  }
  findOptimal() {
    //calculate new basis
    const newBasis = this.basisValues.map((val, i) => {
      if (i === this.leadingRowIndex) {
        let newVal = val.value / this.leadingElement;
        newVal = this.roundValue(newVal);
        return {
          name: this.leadingColIndex,
          value: newVal,
        };
      } else {
        let newVal = val.value -
          this.basisValues[this.leadingRowIndex].value *
          this.coefMatrix[i][this.leadingColIndex] /
          this.leadingElement;
        newVal = this.roundValue(newVal);
        return {
          ...val,
          value: newVal,
        };
      }
    });
    this.basisValues = newBasis;

    //calculate goalFunction
    const newGoalValue = this.currentGoalValue -
      this.basisValues[this.leadingRowIndex].value *
      this.indexRow[this.leadingColIndex];
    this.currentGoalValue = newGoalValue;

    //calculate indexRow
    const newIndexRow = this.indexRow.map((item, i) => {
      let newVal = item -
        this.coefMatrix[this.leadingRowIndex][i] *
        this.indexRow[this.leadingColIndex] /
        this.leadingElement;
      newVal = this.roundValue(newVal);
      return newVal;
    })
    this.indexRow = newIndexRow;
    

    //calculate new matrix
    const newMatrix = this.coefMatrix.map((row, i) => {
      const newRow = row.map((coef, j) => {
        if (i === this.leadingRowIndex) {
          let newVal = coef / this.leadingElement;
          newVal = this.roundValue(newVal);
          return newVal;
        }
        let newVal = coef -
          this.coefMatrix[this.leadingRowIndex][j] *
          this.coefMatrix[i][this.leadingColIndex] /
          this.leadingElement;
        newVal = this.roundValue(newVal);
        return newVal;
      })
      return newRow;
    })
    this.coefMatrix = newMatrix
    //find new leading col
    this.findLeadingCol();
    // last column values
    this.setLastCol();
    // leading row index
    this.findLeadingRow();
    // leading element
    this.setLeadingElement();
  }
  getResult() {
    const newBasisValues = this.basisValues.map((val) => {
      let newValue = parseFloat(val.value).toFixed(3);
      if (newValue.toString().slice(-3) === "999") {
        newValue = Math.round(newValue);
      } else {
        newValue = Math.floor(newValue);
      }
      return {
        ...val,
        value: newValue,
      };
    });
    return newBasisValues;
  }
  toString() {
    console.log(this.lastCol);
    console.log('matrix:', this.coefMatrix);
    console.log("indexRow:", this.indexRow);
    console.log("leadingElement:", this.leadingElement);
  }
  roundValue(value) {
    let roundedValue = +value;
    return roundedValue;
  }
}

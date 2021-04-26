class SimplexData {
  goalFunction = []; // arr of coefficients of goal function
  freeVariables = []; // arr of coefficients of all free variables
  coefRestSystem = []; // arr of coefficients of all restrictions
  signs = []; //arr from signs of each restriction where -1 is '<=' 0 is '=' and 1 is '>='
  numVar = 0; // start variables number
  numRest = 0; // start resctriction number
  way = true; // true -> max; false -> min

  constructor(object, prodRest = null) {
    this.setRestrictionNumber(object.attributes);
    this.setVariablesNumber(object.values);
    this.setGoalFunction(object.values);
    this.setWayOfFunction(true);
    this.setRestrictionSystem(object.attributes, object.values);
    this.setSigns(object.attributes);
    this.setFreeVariables(object.attributes);
  }
  setRestrictionNumber(attributes) {
    this.numRest = attributes.length - 1;
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
  setRestrictionSystem(attributes, values) {
    this.coefRestSystem = attributes.reduce((arr, attr) => {
      if (attr.id === 0) return arr;
      const newRow = values.map((val) => {
        return val.prodValues.filter((prodVal) => {
          return prodVal.id === attr.id;
        })[0].value;
      });
      arr.push(newRow);
      return arr;
    }, []);
  }
  setSigns(attributes) {
    this.signs = attributes.reduce((arr, attr) => {
      if (attr.id === 0) return arr;
      arr.push(-1); // temporary set <= for each restriction
      return arr;
    }, []);
  }
  setFreeVariables(attributes) {
    this.freeVariables = attributes.reduce((arr, attr) => {
      if (attr.id === 0) return arr;
      arr.push(attr.restriction);
      return arr;
    }, []);
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

  constructor(object, prodRest = null) {
    super(object, prodRest);
    this.initSimplexTable();
    while (!this.isFunctionOptimal()) {
      this.findOptimal();
      this.toString();
      console.log('----------------')
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
    let minIndex = 0;
    for (let i = 1; i < this.lastCol.length; i++) {
      if (this.lastCol[minIndex] > this.lastCol[i]) {
        minIndex = i;
      }
    }
    this.leadingRowIndex = minIndex;
  }
  setLastCol() {
    this.lastCol = [];
    for (let i = 0; i < this.basisValues.length - 1; i++) {
      let colValue;
      if (this.coefMatrix[i][this.leadingColIndex] < 0) {
        colValue = null;
      } else {
        colValue =
          this.basisValues[i].value / this.coefMatrix[i][this.leadingColIndex];
      }
      this.lastCol.push(colValue);
    }
  }
  setLeadingElement() {
    console.log(this.lastCol);
    this.leadingElement = this.coefMatrix[this.leadingRowIndex][
      this.leadingColIndex
    ];
  }
  findOptimal() {
    //calculate new basis
    const newBasis = this.basisValues.map((val, i) => {
      if (i === this.leadingRowIndex) {
        return {
          name: this.leadingColIndex,
          value: val.value / this.leadingElement,
        };
      } else {
        const newValue = val.value -
          this.basisValues[this.leadingRowIndex].value *
          this.coefMatrix[i][this.leadingColIndex] /
          this.leadingElement;
        return {
          ...val,
          value: newValue,
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
      const newItem = item -
        this.coefMatrix[this.leadingRowIndex][i] *
        this.indexRow[this.leadingColIndex] /
        this.leadingElement
      return newItem;
    })
    this.indexRow = newIndexRow;
    

    //calculate new matrix
    const newMatrix = this.coefMatrix.map((row, i) => {
      const newRow = row.map((coef, j) => {
        if (i === this.leadingRowIndex) {
          return coef / this.leadingElement;
        }
        const newValue = coef -
          this.coefMatrix[this.leadingRowIndex][j] *
          this.coefMatrix[i][this.leadingColIndex] /
          this.leadingElement;
        return newValue;
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
    return this.basisValues;
  }
  getGoalValue() {
    return this.currentGoalValue;
  }
  toString() {
    console.log('basis: ', this.basisValues);
    console.log('Matrix: ', this.coefMatrix);
    console.log('goalValue: ', this.currentGoalValue);
    console.log('indexRow: ', this.indexRow)
  }

}

export default class Destiny {
  startMatrix = [];
  matrix = []; // weight matrix
  usedMatrix = [];
  rowsMinimal = [];
  colsMinimal = [];
  constructor(prodObj) {
    this.setWeightMatrix(prodObj.attributes, prodObj.values);
    this.setRowsMinimal();
    this.updateMatrixByRows();
    this.setColsMinimal();
    this.updateMatrixByCols();
    this.findOptimal();
  }
  findOptimal() {
    console.log(this.matrix);
    this.usedMatrix = new Array(this.matrix.length).fill([]);
    this.matrix.forEach((_, i) => {
      this.usedMatrix[i] = new Array(this.matrix[i].length).fill(0)
    })
    for (let i = 0; i < this.matrix.length; i++) {
      let zerosNumber = null;
      let rowIndex = null;

      for (let j = 0; j < this.matrix.length; j++) {
        let zerosInRow = this.matrix[j].filter((el, index) => {
          return el === 0 && this.usedMatrix[j][index] === 0;
        });
        if (zerosInRow.length !== 0) {
          if (zerosNumber === null || zerosInRow.length < zerosNumber) {
            zerosNumber = zerosInRow.length;
            rowIndex = j;
          }
        }
      }
      
      let indexOfZero = this.matrix[rowIndex].findIndex((el, i) => {
        if (el === 0 && this.usedMatrix[rowIndex][i] === 0) return true;
        return false;
      });
      for (let j = 0; j < this.matrix.length; j++) {
        if (j === rowIndex) {
          this.usedMatrix[j][indexOfZero] = 1;
          continue;
        }
        if (this.matrix[j][indexOfZero] === 0) {
          this.usedMatrix[j][indexOfZero] = -1;
        }
      }
      
    }
  }
  setColsMinimal() {
    this.colsMinimal = [];
    for (let i = 0; i < this.matrix[0].length; i++) {
      let colMinimal = null;
      for (let j = 0; j < this.matrix.length; j++) {
        if (colMinimal === null || this.matrix[j][i] < colMinimal) {
          colMinimal = this.matrix[j][i];
        }
      }
      this.colsMinimal.push(colMinimal);
    }
  }
  updateMatrixByCols() {
    this.matrix = this.matrix.map((row) => {
      return row.map((el, i) => {
        return el - this.colsMinimal[i];
      });
    });
  }
  updateMatrixByRows() {
    this.matrix = this.matrix.map((row, i) => {
      return row.map((el) => {
        return el - this.rowsMinimal[i];
      });
    });
  }
  setRowsMinimal() {
    this.rowsMinimal = this.matrix.map((row) => {
      let minimal = Math.min.apply(Math, row);
      return minimal;
    });
  }
  setWeightMatrix(attributes, values) {
    this.matrix = attributes.reduce((arr, attr) => {
      const newRow = values.map((val) => {
        return val.prodValues.filter((prodVal) => {
          return prodVal.id === attr.id;
        })[0].value;
      });
      arr.push(newRow);
      return arr;
    }, []);
    this.startMatrix = this.matrix.slice();
  }
}
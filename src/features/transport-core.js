class TransportData {
  prodStocks = []; // Factory stocks
  prodNeeds = []; // Store products need
  wayWeights = []; // Coefficients of way weight
  startPlan = [];
  prodNeedsSum = 0;
  prodStocksSum = 0;
  maxWeight = 0;
  constructor(attributes, values) {
    this.setProdStocks(attributes);
    this.setProdNeeds(values);
    this.setWayWeights(attributes, values);
    this.setProdNeedsSum();
    this.setProdStocksSum();
    this.setMaxWeight();
    if (this.getSummDiff() > 0) {
      this.addNewConsumer();
    };
    this.getStartPlanByNorthWestCorn();
  }
  getStartPlanByNorthWestCorn() {
    let currentPosition = {
      row: 0,
      col: 0
    }
    let newPlan = new Array(this.prodStocks.length);
    for (let i = 0; i < newPlan.length; i++) {
      newPlan[i] = new Array(this.prodNeeds.length).fill(null);
    }
    const basisLength = this.prodNeeds.length + this.prodStocks.length - 1;
    let stocks = this.prodStocks.slice();
    let needs = this.prodNeeds.slice();
    for (let i = 0; i < basisLength; i++) {
      const row = currentPosition.row;
      const col = currentPosition.col;
      const minValue = Math.min(stocks[row], needs[col]);
      newPlan[row][col] = minValue;
      stocks[row] = stocks[row] - minValue;
      needs[col] = needs[col] - minValue;
      if (needs[col] === 0 && stocks[row] === 0 && i < basisLength - 1) {
        if (this.wayWeights[row + 1][col] > this.wayWeights[row][col + 1]) {
          currentPosition.col++;
        } else {
          currentPosition.row++;
        }
      } else if (needs[col] === 0) {
        currentPosition.col++;
      } else {
        currentPosition.row++;
      }
    }
    this.startPlan = newPlan;
  }

  addNewConsumer() {
    const sumDiff = this.getSummDiff();
    this.prodNeeds.push(sumDiff);
    this.wayWeights.forEach(wayRow => {
      wayRow.push(this.maxWeight + 100);
    })
  }
  getSummDiff() {
    return this.prodStocksSum - this.prodNeedsSum;
  }
  setProdStocksSum() {
    this.prodStocksSum = this.prodStocks.reduce((sum, val) => sum + val, 0);
  }
  setProdNeedsSum() {
    this.prodNeedsSum = this.prodNeeds.reduce((sum, val) => sum + val, 0);
  }
  setMaxWeight() {
    this.maxWeight = this.wayWeights.reduce((max, weightRow) => {
      const maxInRow = weightRow.reduce((maxInRow, weight) => {
        return maxInRow < weight ? weight : maxInRow;
      }, 0);
      return max < maxInRow ? maxInRow : max;
    }, 0);
  }
  setProdNeeds(values) {
    this.prodNeeds = values.map((value) => {
      return value.prodValues[0].value;
    });
  }
  setProdStocks(attributes) {
    this.prodStocks = attributes.reduce((arr, attr) => {
      if (attr.id === 0) return arr;
      arr.push(attr.restriction);
      return arr;
    }, []);
  }
  setWayWeights(attributes, values) {
    this.wayWeights = attributes.reduce((arr, attr) => {
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
}


export default class Transport extends TransportData {
  currentGoalFunction = 0;
  currentPlan = [];
  currentCycle = {};
  consumerPotential = [];
  providerPotential = [];
  pseudoTarriffs = [];
  isPlanOptimal = false;
  logArray = [];
  constructor(prodObject) {
    super(prodObject.attributes, prodObject.values);
    this.countGoalFunction();

    this.currentPlan = this.startPlan;
    this.countPotential();
    this.countPseudoTarriffs();
    let logPlan = this.currentPlan.map(planRow => {
      let row = planRow.map(obj => obj);
      return row;
    })
    let logPotentials = {
      provider: this.providerPotential.slice(),
      consumer: this.consumerPotential.slice()
    }
    let logPseudoTarriffs = this.pseudoTarriffs.slice();
    this.countGoalFunction();
    let logGoalFunction = this.currentGoalFunction;

    this.logArray.push({
      logPlan,
      logPotentials,
      logPseudoTarriffs,
      logGoalFunction,
    });
    while (!this.isPlanOptimal) {
      this.currentCycle = new TransportCycle(this.pseudoTarriffs, this.currentPlan, this.wayWeights);
      if (this.currentCycle.isNegativeExist) {
        this.currentCycle.setSigns();
        this.currentCycle.findCycleMinimal();

        this.madeNewPlan();
        this.countPotential();
        this.countPseudoTarriffs();

        let logPlan = this.currentPlan.map((planRow) => {
          let row = planRow.map((obj) => obj);
          return row;
        });
        let logPotentials = {
          provider: this.providerPotential.slice(),
          consumer: this.consumerPotential.slice(),
        };
        let logPseudoTarriffs = this.pseudoTarriffs.slice();
        this.countGoalFunction();
        let logGoalFunction = this.currentGoalFunction;
        this.logArray.push({
          logPlan,
          logPotentials,
          logPseudoTarriffs,
          logGoalFunction,
        });
      } else {
        this.isPlanOptimal = true;
      }
    }

  }
  countPseudoTarriffs() {
    this.pseudoTarriffs = new Array(this.wayWeights.length).fill([]);
    for (let i = 0; i < this.wayWeights.length; i++) {
      this.pseudoTarriffs[i] = new Array(this.wayWeights[i].length).fill(null);
      for (let j = 0; j < this.wayWeights[i].length; j++) {
        this.pseudoTarriffs[i][j] = {
          used: false,
          val: this.wayWeights[i][j] -
          (this.providerPotential[i] + this.consumerPotential[j]),
        }
      }
    }
  }

  madeNewPlan() {
    let minimal = this.currentCycle.cycleMinimal;
    let minimalsArr = [];
    this.currentCycle.nodeArray.forEach((node) => {
      this.currentPlan[node.row][node.col] += node.sign * minimal;
      if (node.sign === -1 && node.val === minimal) {
        minimalsArr.push(node);
      }
    });
    while (minimalsArr.length > 1) {
      let minlWeightNode = minimalsArr.reduce((minNode, node) => {
        if (
          minNode === null ||
          this.wayWeights[node.row][node.col] < minNode.val
        ) {
          minNode = {};
          minNode.val = this.wayWeights[node.row][node.col];
          minNode.node = node;
        }
        return minNode;
      }, null);
      this.currentPlan[minlWeightNode.node.row][minlWeightNode.node.col] = 0;
      minimalsArr = minimalsArr.filter((node) => {
        return (
          node.col !== minlWeightNode.node.col &&
          node.row !== minlWeightNode.node.row
        );
      });
    }
    let minNode = minimalsArr[0];
    this.currentPlan[minNode.row][minNode.col] = null;
  }
  countGoalFunction() {
    let sum = 0;
    for (let i = 0; i < this.currentPlan.length; i++) {
      for (let j = 0; j < this.currentPlan[i].length; j++) {
        let element = this.currentPlan[i][j];
        if (element !== null) {
          sum += element * this.wayWeights[i][j];
        }
      }
    }
    this.currentGoalFunction = sum;
  }
  countPotential() {
    this.providerPotential = new Array(this.prodStocks.length).fill(null);
    this.consumerPotential = new Array(this.prodNeeds.length).fill(null);
    this.providerPotential[0] = 0;
    let isOver = false;
    let isRowLeading = true;
    while (!isOver) {
      if (isRowLeading) {
        let hasNullCol = false;
        for (let i = 0; i < this.providerPotential.length; i++) {
          if (this.providerPotential[i] === null) {
            continue;
          }
          for (let j = 0; j < this.currentPlan[i].length; j++) {
            if (
              this.currentPlan[i][j] !== null &&
              this.consumerPotential[j] === null
            ) {
              hasNullCol = true;
              this.consumerPotential[j] =
                this.wayWeights[i][j] - this.providerPotential[i];
            }
          }
        }
        if (!hasNullCol) {
          isOver = true;
        }
        isRowLeading = false;
      } else {
        let hasNullRow = false;
        for (let i = 0; i < this.consumerPotential.length; i++) {
          if (this.consumerPotential[i] === null) continue;
          for (let j = 0; j < this.currentPlan.length; j++) {
            if (
              this.currentPlan[j][i] !== null &&
              this.providerPotential[j] === null
            ) {
              hasNullRow = true;
              this.providerPotential[j] =
                this.wayWeights[j][i] - this.consumerPotential[i];
            }
          }
        }
        if (!hasNullRow) {
          isOver = true;
        }
        isRowLeading = true;
      }
    }
  }
}


class TransportCycle {
  startNode = null;
  currentNode = null;
  maxPseudoTarriff = null;
  matrix = null;
  cycleMinimal = null;

  nodeArray = [];
  pseudoTarriffs = [];
  wayWeights = [];

  isCycleOver = false;
  isNegativeExist = true;
  isSolutionFound = false;

  constructor(pseudoTarriffs, transportMatrix, wayWeights) {
    this.nodeArray = [];
    this.matrix = transportMatrix;
    this.pseudoTarriffs = pseudoTarriffs;
    this.wayWeights = wayWeights;
    while (!this.isSolutionFound && this.isNegativeExist) {
      this.nodeArray = [];
      this.isCycleOver = false;
      this.findMaxPseudoTarriff();
      this.startNode = new TransportNode(
        this.maxPseudoTarriff,
        this.matrix.length,
        this.matrix[0].length
      );
      this.currentNode = this.startNode;
      this.nodeArray.push(this.startNode);
      this.madeCycle();
      if (this.nodeArray.length) {
        this.isSolutionFound = true;
      }
    }
  }

  findMaxPseudoTarriff() {
    let minTarrif = null;
    for (let i = 0; i < this.pseudoTarriffs.length; i++) {
      for (let j = 0; j < this.pseudoTarriffs[i].length; j++) {
        if (!this.pseudoTarriffs[i][j].used && (this.pseudoTarriffs[i][j].val < 0)) {
          if (minTarrif === null) {
            minTarrif = {
              val: this.pseudoTarriffs[i][j].val,
              col: j,
              row: i,
            };
          } else if (this.pseudoTarriffs[i][j].val < minTarrif.val) {
            minTarrif = {
              val: this.pseudoTarriffs[i][j].val,
              col: j,
              row: i,
            };
          } else if (
            this.pseudoTarriffs[i][j].val == minTarrif.val &&
            this.wayWeights[i][j] <
            this.wayWeights[minTarrif.row][minTarrif.col]
          ) {
            minTarrif = {
              val: this.pseudoTarriffs[i][j].val,
              col: j,
              row: i,
            };
          }
        }
      }
    }
    if (minTarrif === null) {
      this.isNegativeExist = false;
    } else {
      this.pseudoTarriffs[minTarrif.row][minTarrif.col].used = true;
      this.maxPseudoTarriff = minTarrif;
    }
  }
  findCycleMinimal() {
    let minimal = null;
    this.nodeArray.forEach((node) => {
      if (node.sign === -1 && (node.val < minimal || minimal === null)) {
        minimal = node.val;
      }
    });
    this.cycleMinimal = minimal;
  }
  setSigns() {
    this.nodeArray[0].sign = 1;
    if (this.nodeArray[0].wayMade === this.nodeArray[this.nodeArray.length - 1].wayMade) {
      this.nodeArray[this.nodeArray.length - 1].sign = null;
    } else {
      this.nodeArray[this.nodeArray.length - 1].sign = -1;
    }
    let sign = -1;
    for (let i = 1; i < this.nodeArray.length - 1; i++) {
      this.nodeArray[i].sign = null;
      let currentEl = this.nodeArray[i];
      let nextEl = this.nodeArray[i + 1];
      if (currentEl.wayMade !== nextEl.wayMade) {
        this.nodeArray[i].sign = sign;
        sign = sign * -1;
      }
    }
  }
  madeCycle() {
    let temp = 0;
    while (!this.isCycleOver && temp < 200) {
      this.findNextNode();
      temp++;
      if (this.currentNode === this.startNode) {
        this.isCycleOver = true;
        this.nodeArray.pop();
        break;
      }
      if (this.currentNode.isNodeEnd()) {
        if (this.nodeArray.length > 1) {
          this.nodeArray.pop();
          this.currentNode = this.nodeArray[this.nodeArray.length - 1];
        }
      }
    }
  }
  findNextNode() {
    while (!this.currentNode.isNodeEnd()) {
      let way = this.currentNode.getWay();
      let nextNode = null;
      for (let i = this.currentNode.row, j = this.currentNode.col;;) {
        j += way.col;
        i += way.row;
        if (i < 0 || j < 0 || i > this.matrix.length - 1 || j > this.matrix[i].length - 1) {
          break;
        }
        if (i === this.startNode.row && j === this.startNode.col) {
          nextNode = this.startNode;
          this.startNode.wayMade = way.way;
          break;
        }
        if (this.matrix[i][j] === 0) {
          break;
        }
        if (this.matrix[i][j] !== null) {
          nextNode = new TransportNode(
            {
              col: j,
              row: i,
              val: this.matrix[i][j],
            },
            this.matrix.length,
            this.matrix[0].length
          );
          this.currentNode.endWay(way.way);
          nextNode.wayMade = way.way;
          nextNode.endNextNodeWay(way.way);
          break;
        }
      }
      if (nextNode !== null) {
        this.nodeArray.push(nextNode);
        this.currentNode = nextNode;
        break;
      } else {
        this.currentNode.endWay(way.way);
      }
    }
  }

}


class TransportNode {
  col = null;
  row = null;
  val = null;
  wayMade = null;
  ways = {
    l: true,
    r: true,
    b: true,
    t: true,
  };
  constructor(node, colLength, rowLength) {
    this.col = node.col;
    this.row = node.row;
    this.val = node.val;
    if (node.col === 0) {
      this.ways.l = false;
    }
    if (node.col === rowLength - 1) {
      this.ways.r = false;
    }
    if (node.row === 0) {
      this.ways.t = false;
    }
    if (node.row === colLength - 1) {
      this.ways.b = false;
    }

  }
  isNodeEnd() {
    if (this.ways.l || this.ways.r || this.ways.b || this.ways.t) {
      return false;
    } else {
      return true;
    }
  }
  endWay(way) {
    this.ways[way] = false;
  }
  endNextNodeWay(way) {
    switch (way) {
      case "l": {
        this.ways.r = false;
        break;
      }
      case "r": {
        this.ways.l = false;
        break;
      }
      case "b": {
        this.ways.t = false;
        break;
      }
      case "t": {
        this.ways.b = false;
        break;
      }
      default :{
        return;
      }
    }
  }
  getWay() {
    if (this.ways.l) {
      return {
        row: 0,
        col: -1,
        way: "l",
      };
    }
    if (this.ways.r) {
      return {
        row: 0,
        col: 1,
        way: "r",
      };
    }
    if (this.ways.b) {
      return {
        row: 1,
        col: 0,
        way: "b",
      };
    }
    if (this.ways.t) {
      return {
        row: -1,
        col: 0,
        way: "t",
      };
    }
    return null;
  }
}
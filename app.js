// from inches
const unit_rate = {
  feet: 0.3048,
  inches: 0.0254,
  yards: 46660,
  meters: 1.0,
  centimeters: 0.01,
  density: 2130,
  density_lbs: 133
};

const calculatorList = document.querySelector(".calculator_list");
const empty = document.querySelector("#empty");

const toggle = document.querySelector('[data-setting="metric"]');
const bagSize = document.querySelector('[data-setting="bagSize"]');
const costPerBag = document.querySelector('[data-setting="costPerBag"]');
const wastePercentage = document.querySelector(
  '[data-setting="wastePercentage"]'
);

const totalConcrete = document.querySelector("#totalConcrete");
const totalBags = document.querySelector("#totalBags");
const totalCost = document.querySelector("#totalCost");

let total = 0;

let wastePercentageAmount = 1;
let volumeYards = 0;
let volumeFeet = 0;
let volumeMeters = 0;

let kgs = 0;
let lbs = 0;

// totals in inches
const measurements = {
  slab: {
    type: "slab",
    name: "Slab",
    subtotals: 0,
    totals: [],
    template: [
      { unit1: null, unit2: null, unit3: null },
      { unit1: null, unit2: null, unit3: null },
      { unit1: null, unit2: null, unit3: null },
      { quantity: 1 }
    ]
  },
  wall: {
    type: "wall",
    name: "Wall",
    subtotals: 0,
    totals: [],
    template: [
      { unit1: null, unit2: null, unit3: null },
      { unit1: null, unit2: null, unit3: null },
      { unit1: null, unit2: null, unit3: null },
      { quantity: 1 }
    ]
  },
  footing: {
    type: "footing",
    name: "Footing",
    subtotals: 0,
    totals: [],
    template: [
      { unit1: null, unit2: null, unit3: null },
      { unit1: null, unit2: null, unit3: null },
      { unit1: null, unit2: null, unit3: null },
      { quantity: 1 }
    ]
  },
  column: {
    type: "column",
    name: "Column",
    subtotals: 0,
    totals: [],
    template: [
      { unit1: null, unit2: null, unit3: null },
      { unit1: null, unit2: null, unit3: null },
      { quantity: 1 }
    ]
  },
  curbGutter: {
    type: "curbGutter",
    name: "Curb / Gutter",
    subtotals: 0,
    totals: [],
    template: [
      { unit1: null, unit2: null, unit3: null },
      { unit1: null, unit2: null, unit3: null },
      { unit1: null, unit2: null, unit3: null },
      { unit1: null, unit2: null, unit3: null },
      { unit1: null, unit2: null, unit3: null },
      { quantity: 1 }
    ]
  },
  stairs: {
    type: "stairs",
    name: "Stairs",
    subtotals: 0,
    totals: [],
    template: [
      { unit1: null, unit2: null, unit3: null },
      { unit1: null, unit2: null, unit3: null },
      { unit1: null, unit2: null, unit3: null },
      { unit1: null, unit2: null, unit3: null },
      { quantity: 1 }
    ]
  },
  tube: {
    type: "tube",
    name: "Circle / Tube",
    subtotals: 0,
    totals: [],
    template: [
      { unit1: null, unit2: null, unit3: null },
      { unit1: null, unit2: null, unit3: null },
      { unit1: null, unit2: null, unit3: null },
      { quantity: 1 }
    ]
  }
};

const twoDecimals = (value) => {
  return parseFloat(value).toFixed(2);
};

// get number value of a given input
const selector = (calculator, row) => {
  const rowGroup = calculator.querySelector(`[data-row="${row}"]`);
  const unitGroup = rowGroup.querySelector(
    `[data-unit="${settings.unitName()}"]`
  );
  const unit1Multiplier = settings.metric ? 1 : 12;

  const hasValue = (el) => {
    return parseFloat(!el.value ? 0 : el.value);
  };

  // check if there is a unit group... quantity won't have one
  if (unitGroup) {
    return (
      hasValue(unitGroup.querySelector('[data-type="unit1"]')) *
        unit1Multiplier +
      hasValue(unitGroup.querySelector('[data-type="unit2"]')) +
      hasValue(unitGroup.querySelector('[data-type="unit3"]'))
    );
  } else {
    return hasValue(rowGroup.querySelector('[data-type="quantity"]'));
  }
};

// create template for all calculator types
const calculateTemplate = (type) => {
  const calculators = calculatorList.querySelectorAll(
    `[data-calculator="${type}"]`
  );
  measurements[type].totals = [];
  measurements[type].subtotals = 0;

  if (calculators.length) {
    calculators.forEach((calculator, index) => {
      let length, width, quantity, height, depth;
      let formula;

      switch (type) {
        case measurements.slab.type:
          depth = selector(calculator, "depth");
          length = selector(calculator, "length");
          width = selector(calculator, "width");
          quantity = selector(calculator, "quantity");

          formula = length * width * depth * quantity;
          break;
        case measurements.footing.type:
          depth = selector(calculator, "depth");
          length = selector(calculator, "length");
          width = selector(calculator, "width");
          quantity = selector(calculator, "quantity");

          formula = length * width * depth * quantity;
          break;
        case measurements.column.type:
          const diameter = selector(calculator, "diameter");
          height = selector(calculator, "height");
          quantity = selector(calculator, "quantity");

          formula = (diameter * Math.PI * height * height * quantity) / 4;
          break;
        case measurements.curbGutter.type:
          const curbDepth = selector(calculator, "curbDepth");
          const curbHeight = selector(calculator, "curbHeight");
          const flagThickness = selector(calculator, "flagThickness");
          const gutterWidth = selector(calculator, "gutterWidth");
          length = selector(calculator, "length");

          formula =
            quantity *
            (length * curbDepth * curbHeight +
              length * flagThickness * (gutterWidth + curbDepth));
          break;
        case measurements.stairs.type:
          const rise = selector(calculator, "rise");
          const run = selector(calculator, "run");
          const platformDepth = selector(calculator, "platformDepth");
          width = selector(calculator, "width");
          quantity = selector(calculator, "quantity");

          let stepCount = 0;
          // formula
          for (stepCount = 0; stepCount < quantity; stepCount++) {
            if (stepCount === quantity - 1) {
              formula = width * rise * (stepCount + 1) * platformDepth;
            } else {
              formula += width * rise * (stepCount + 1) * run;
            }
          }

          break;
        case measurements.tube.type:
          const innerDiameter = selector(calculator, "innerDiameter");
          const outerDiameter = selector(calculator, "outerDiameter");
          height = selector(calculator, "height");
          quantity = selector(calculator, "quantity");

          if (outerDiameter < innerDiameter) {
            settings.deliverMessage(e, "tube change");
            return;
          }
          formula =
            (height *
              Math.PI *
              (outerDiameter * outerDiameter - innerDiameter * innerDiameter) *
              quantity) /
            4;
          break;
        default:
        //something
      }
      measurements[type].totals[index] = formula;

      measurements[type].subtotals = measurements[type].totals.reduce(
        (accumulator, value) => {
          return accumulator + value;
        },
        0
      );
    });
  } else {
    measurements[type].subtotals = 0;
  }
};

// local storage method
// decides whether to set array or to push new item into array
const typeCheck = (savedCalculator, condition, method) => {
  const objectTemplate = (type) => {
    return {
      type: measurements[type].type,
      name: measurements[type].name,
      template: measurements[type].template
    };
  };

  const setSavedCalculator = (object) => {
    return method === "set"
      ? (savedCalculator = [object])
      : savedCalculator.push(object);
  };

  switch (condition /*calculator.type*/) {
    case measurements.slab.type:
      setSavedCalculator(objectTemplate(measurements.slab.type));
      break;
    case measurements.wall.type:
      setSavedCalculator(objectTemplate(measurements.wall.type));
      break;
    case measurements.footing.type:
      setSavedCalculator(objectTemplate(measurements.footing.type));
      break;
    case measurements.column.type:
      setSavedCalculator(objectTemplate(measurements.column.type));
      break;
    case measurements.curbGutter.type:
      setSavedCalculator(objectTemplate(measurements.curbGutter.type));
      break;
    case measurements.stairs.type:
      setSavedCalculator(objectTemplate(measurements.stairs.type));
      break;
    case measurements.tube.type:
      setSavedCalculator(objectTemplate(measurements.tube.type));
      break;
    default:
      savedCalculator = [];
  }
};

// add checked class to input when checked
const setCheckedStyle = (input) => {
  const inputClass = input.previousSibling.classList;

  input.checked
    ? inputClass.add("w--redirected-checked")
    : inputClass.remove("w--redirected-checked");
};

const setSelectClass = (el, isSelected) => {
  const selectClass = el.classList;

  !isSelected ? selectClass.remove("is-faded") : selectClass.add("is-faded");
};

// append a new list item to the list
const appendTemplate = (type) => {
  if (type !== "main") {
    let template = document
      .getElementById(`js-${type}-template`)
      .getElementsByTagName("li")[0];
    const clonedItem = template.cloneNode(true);
    calculatorList.appendChild(clonedItem);
  }
};

const settings = {
  metric: false,
  unitName: () => {
    return settings.metric ? "metric" : "imperial";
  },
  bagSize: "80",
  costPerBag: "",
  wastePercentage: "0",
  initLocalStorage: () => {
    // check to see if settings is saved in local storage
    // if saved, parse it and set the inputs to the correct values
    const storedSettings = JSON.parse(localStorage.getItem("settings"));

    if (storedSettings) {
      // unit type check
      if (storedSettings.metric) {
        toggle.checked = true;
        settings.metric = true;
      } else {
        toggle.checked = false;
        settings.metric = false;
      }
      document.body.className = `is-${settings.unitName()}`;

      // bag size check
      bagSize.value = storedSettings.bagSize;

      // cost per bag check
      storedSettings.costPerBag !== ""
        ? (costPerBag.value = twoDecimals(storedSettings.costPerBag))
        : (costPerBag.value = "");

      // waste percentage check
      wastePercentage.value = storedSettings.wastePercentage;
    } else {
      toggle.checked = settings.metric;
      bagSize.value = settings.bagSize;
      costPerBag.value = "";
      wastePercentage.value = settings.wastePercentage;

      // set current item back to local storage
      localStorage.setItem(
        "settings",
        JSON.stringify({
          metric: settings.metric,
          bagSize: settings.bagSize,
          costPerBag: settings.costPerBag,
          wastePercentage: settings.wastePercentage
        })
      );
    }
    setCheckedStyle(toggle);
  },
  updateLocalStorage: () => {
    // when inputs change, update the local storage for settings
    const settings = {
      metric: toggle.checked,
      bagSize: bagSize.value,
      costPerBag: costPerBag.value,
      wastePercentage: wastePercentage.value
    };
    //calculator.convertRows();
    localStorage.setItem("settings", JSON.stringify(settings));
  },
  timer: 0,
  deliverMessage: (e, action) => {
    const notification = document.querySelector("#notification");
    const title = notification.querySelector("h5");
    const message = notification.querySelector("p");

    let n = "";
    let t = "✓ success";

    if (notification.classList.contains("is-active")) {
      clearTimeout(calculator.timer);
      notification.classList.remove("is-active");
    }

    // match the name for the given calculator
    const matchName = (calculator) => {
      for (const key of Object.entries(measurements)) {
        if (calculator === key[0]) {
          return key[1].name;
        }
      }
    };

    switch (action) {
      case "tube change":
        n = "inner diameter must be smaller than outer diameter";
        t = "✗ warning";
        break;
      case "update name":
        n = `${matchName(
          e.target.closest("li").dataset.calculator
        )} name updated`;
        break;
      case "create":
        n = `New ${matchName(
          e.target.nextSibling.firstChild.dataset.type
        )} added`;
        break;
      case "remove":
        n = `${matchName(e.target.closest("li").dataset.calculator)} removed`;
        break;
      case "reset":
        n = "calculator reset";
        break;
      case "waste percentage change":
        n = "waste percentage updated";
        break;
      case "cost per bag change":
        n = "cost per bag updated";
        break;
      case "bag size change":
        n = "bag size updated";
        break;
      default:
        n = "";
    }

    message.textContent = n;
    title.textContent = t;
    title.textContent === "✗ warning"
      ? (title.style.color = "red")
      : (title.style.color = "#ffb238");

    setTimeout(() => {
      notification.classList.add("is-active");
    }, 200);

    calculator.timer = setTimeout(() => {
      notification.classList.remove("is-active");
    }, 3000);
  }
};

const calculator = {
  type: JSON.parse(document.querySelector("#metadata").textContent).type, //document.body.dataset.calculator,
  calculateTotal: (e) => {
    calculateTemplate(measurements.slab.type);
    calculateTemplate(measurements.wall.type);
    calculateTemplate(measurements.footing.type);
    calculateTemplate(measurements.column.type);
    calculateTemplate(measurements.curbGutter.type);
    calculateTemplate(measurements.stairs.type);
    calculateTemplate(measurements.tube.type);

    total =
      measurements.slab.subtotals +
      measurements.wall.subtotals +
      measurements.footing.subtotals +
      measurements.column.subtotals +
      measurements.curbGutter.subtotals +
      measurements.stairs.subtotals +
      measurements.tube.subtotals;

    // run calculation based on unit type
    const wastePercentageAmount = wastePercentage.value / 100 + 1;
    const isZero = (unitType) => {
      return unitType.toFixed(2) > 0 ? unitType.toFixed(2) : "— —";
    };

    if (!settings.metric) {
      // run imperial code
      volumeYards = (total / 46660) * wastePercentageAmount;
      totalConcrete.textContent = isZero(volumeYards);

      volumeFeet = (total / 1728) * wastePercentageAmount;
      lbs = (volumeFeet * 133) / bagSize.value;

      totalBags.textContent = isZero(lbs);
    } else {
      // run metric code
      volumeMeters = total * wastePercentageAmount;
      totalConcrete.textContent = isZero(volumeMeters);

      kgs = (volumeMeters * 2130) / bagSize.value;

      totalBags.textContent = isZero(kgs);
    }

    // set total cost
    if (calculatorList.children.length && costPerBag.value !== "") {
      totalCost.textContent = isZero(
        twoDecimals(totalBags.textContent) * twoDecimals(costPerBag.value)
      );
    } else {
      totalCost.textContent = "— —";
    }
  },
  unaccountedAmounts: [],
  convertRows: () => {
    const getDecimalPart = (num, unitType) => {
      if (Number.isInteger(num)) {
        return 0;
      }

      const decimalStr = num.toString().split(".")[1];
      return unitType === "imperial"
        ? parseFloat(`.${decimalStr}`)
        : Number(decimalStr);
    };

    const isBlank = (unit) => {
      return unit.value !== "" ? parseFloat(unit.value) : 0;
    };

    const unitMultiplier = (unit) => {
      return unit.value * 100;
    };

    const isOverNine = (value) => {
      const thirdValue = value.toFixed(4).toString().split(".")[1].slice(2, 3);
      const fourthValue = value.toFixed(4).toString().split(".")[1].slice(3, 4);
      return thirdValue === 9 && fourthValue > 5 ? 9 : thirdValue;
      // with the above, round up instead and add 1 to cm instead of rounding down
    };

    let calculatorListItems = Array.from(calculatorList.children);

    calculatorListItems.forEach((listItem, listItemIndex) => {
      if (!calculator.unaccountedAmounts[listItemIndex]) {
        calculator.unaccountedAmounts.push({
          rows: []
        });
      }
      let rows = Array.from(listItem.querySelector("ul").children);

      rows.forEach((row, rowIndex) => {
        let metricRow = row.querySelector(`[data-unit="metric"]`);
        let imperialRow = row.querySelector(`[data-unit="imperial"]`);

        let getRow =
          calculator.unaccountedAmounts[listItemIndex].rows[rowIndex];

        let theRow = isNaN(getRow) ? (getRow = 0) : getRow;

        if (metricRow && imperialRow) {
          let metricUnit1 = metricRow.querySelector('[data-type="unit1"]');
          let metricUnit2 = metricRow.querySelector('[data-type="unit2"]');
          let metricUnit3 = metricRow.querySelector('[data-type="unit3"]');

          let imperialUnit1 = imperialRow.querySelector('[data-type="unit1"]');
          let imperialUnit2 = imperialRow.querySelector('[data-type="unit2"]');
          let imperialUnit3 = imperialRow.querySelector('[data-type="unit3"]');

          if (settings.unitName() !== "metric") {
            // metric to imperial
            const dyadicValues = [
              0,
              0.0625,
              0.125,
              0.1875,
              0.25,
              0.3125,
              0.375,
              0.4375,
              0.5,
              0.5625,
              0.625,
              0.6875,
              0.75,
              0.8175,
              0.875,
              0.9375
            ];

            const totalInches =
              unitMultiplier(metricUnit1) /*metric*/ / 2.54 +
              unitMultiplier(metricUnit2) /*metric*/ / 2.54 +
              unitMultiplier(metricUnit3) /*metric*/ / 2.54 +
              theRow * 39.37;
            const feetFromTotalInches = Math.floor(totalInches / 12);
            const leftoverInches = totalInches - 12 * feetFromTotalInches;
            const leftoverDyadicInches = getDecimalPart(
              leftoverInches,
              "imperial"
            ); //leftoverInches % 2;
            const dyadicAmount = dyadicValues.reduce((prev, curr) => {
              return Math.abs(curr - leftoverDyadicInches) <
                Math.abs(prev - leftoverDyadicInches)
                ? curr
                : prev;
            });
            theRow = totalInches - dyadicAmount.toFixed(3);

            imperialUnit1.value =
              feetFromTotalInches !== 0 ? feetFromTotalInches : "";
            imperialUnit2.value = Math.floor(leftoverInches);
            imperialUnit3.value = dyadicAmount;

            setSelectClass(
              imperialUnit1,
              parseFloat(imperialUnit1.value) === 0
            );
            setSelectClass(
              imperialUnit2,
              parseFloat(imperialUnit2.value) === 0
            );
            setSelectClass(
              imperialUnit3,
              parseFloat(imperialUnit3.value) === 0
            );
          } else {
            // imperial to metric
            // FEET/INCHES TO METERS
            // 3ft × 0.3048 + 2in × 0.0254
            // = 0.9652m

            const totalMeters =
              //(leftoverDyadicAmount / 39.37) * 100;
              (isBlank(imperialUnit1) * 12 +
                isBlank(imperialUnit2) +
                isBlank(imperialUnit3)) /
              39.37;
            const metersValue = Math.floor(totalMeters);
            const cmValue =
              totalMeters > 0
                ? twoDecimals(String(getDecimalPart(totalMeters)).slice(0, 2)) /
                  100
                : "0";

            const mmValue =
              totalMeters > 0
                ? parseFloat(isOverNine(totalMeters)) / 1000
                : "0";
            calculator.unaccountedAmounts[listItemIndex].rows[rowIndex] =
              totalMeters - totalMeters.toFixed(3);

            metricUnit1.value = metersValue != "0" ? metersValue : "";
            metricUnit2.value = cmValue != "0" ? cmValue.toFixed(2) : "0";
            metricUnit3.value = mmValue != "0" ? mmValue.toFixed(3) : "0";

            setSelectClass(metricUnit1, parseFloat(metricUnit1.value) === 0);
            setSelectClass(metricUnit2, parseFloat(metricUnit2.value) === 0);
            setSelectClass(metricUnit3, parseFloat(metricUnit3.value) === 0);
          }
        }
      });
    });
  },
  render: (savedCalculator) => {
    if (savedCalculator) {
      if (savedCalculator.length) {
        empty.style.display = "none";
        if (totalConcrete.textContent === "— —") {
          calculatorList.innerHTML = "";
        }
        savedCalculator.forEach((item) => {
          appendTemplate(item.type);
        });
      } else {
        const type = document.body.dataset.calculator;
        type ? appendTemplate(type) : (empty.style.display = "block");
      }

      // loop over each row in the calculator & match it with the appropriate object in localStorage
      const calculatorItems = calculatorList.getElementsByClassName(
        "calculator_list-item"
      );

      if (calculatorItems.length) {
        Array.from(calculatorItems).forEach((listItem, listItemIndex) => {
          const nameInput = listItem.getElementsByTagName("input")[0];

          nameInput.value = savedCalculator[listItemIndex].name;

          Array.from(listItem.getElementsByTagName("li")).forEach(
            (row, index) => {
              const unitGroup = row.querySelector(
                `[data-unit="${settings.unitName()}"]`
              );

              const value = (unit) => {
                return savedCalculator[listItemIndex].template[index][unit];
              };

              if (unitGroup) {
                const unit1 = unitGroup.querySelector('[data-type="unit1"]');
                const unit2 = unitGroup.querySelector('[data-type="unit2"]');
                const unit3 = unitGroup.querySelector('[data-type="unit3"]');

                if (unit1) {
                  unit1.value = value("unit1");
                }
                if (unit2) {
                  unit2.value = value("unit2") ? value("unit2") : 0;
                  setSelectClass(unit2, unit2.value == 0);
                }
                if (unit3) {
                  unit3.value = value("unit3") ? value("unit3") : 0;
                  setSelectClass(unit3, unit3.value == 0);
                }
              } else {
                const quantity = row.querySelector('[data-type="quantity"]');
                if (quantity) {
                  quantity.value = value("quantity");
                }
              }
            }
          );
        });
      } else {
      }
    }
  },
  getLocalStorage: () => {
    let savedCalculator = localStorage.getItem("calculator")
      ? JSON.parse(localStorage.getItem("calculator"))
      : [];

    // check if any of the inputs have a value assigned to them
    // if not, start with a new calculator

    if (!savedCalculator.length) {
      typeCheck(savedCalculator, calculator.type, "set");
      localStorage.setItem("calculator", JSON.stringify(savedCalculator));
      calculator.render(savedCalculator);
    } else if (savedCalculator.length && totalConcrete.textContent === "— —") {
      typeCheck(savedCalculator, calculator.type, "set");
      localStorage.setItem("calculator", JSON.stringify(savedCalculator));
      calculator.render(savedCalculator);
    } else {
      savedCalculator = localStorage.getItem("calculator");
      calculator.render(JSON.parse(savedCalculator));
    }
    /*
    if (
      !savedCalculator.length ||
      (savedCalculator.length && totalConcrete.textContent === "— —")
    ) {
      typeCheck(savedCalculator, calculator.type, "set");
      localStorage.setItem("calculator", JSON.stringify(savedCalculator));
      calculator.render(savedCalculator);
    } else {
      savedCalculator = localStorage.getItem("calculator");
      calculator.render(JSON.parse(savedCalculator));
    }
    */
  },
  setLocalStorage: () => {
    let savedCalculator = [];

    typeCheck(
      savedCalculator,
      calculator.type /*&& localStorage.getItem("calculator").length*/,
      "push"
    );

    localStorage.setItem("calculator", JSON.stringify(savedCalculator));
  },
  updateLocalStorage: (e, action) => {
    //const calculatorType = calculator.type + "-calculator";
    const savedCalculator = JSON.parse(localStorage.getItem("calculator"));

    if (action === "create") {
      const type = e.target.nextSibling.firstChild.dataset.type; //e.target.nextSibling.firstChild.dataset.type;

      typeCheck(savedCalculator, type, "push");

      localStorage.setItem("calculator", JSON.stringify(savedCalculator));
    } else if (action === "remove") {
      const calculator = e.target.closest("li"), // the lists list item
        calculatorIndex = Array.from(calculatorList.children).indexOf(
          calculator
        );

      savedCalculator.splice(calculatorIndex, 1);
      localStorage.setItem("calculator", JSON.stringify(savedCalculator));
    } else if (action === "update") {
      // read the value from the input
      // loop through all the keys in the storage item
      // set the indexed storage item to value of input
      // reset the localStorage Item
      const calculatorRow = e.target.closest("li"),
        calculatorRows = calculatorRow.parentNode,
        calculatorRowIndex = Array.from(calculatorRows.children).indexOf(
          calculatorRow
        ),
        calculatorListItem = calculatorRows.parentNode, // the lists list item
        calculatorListIndex = Array.from(calculatorList.children).indexOf(
          calculatorListItem
        );
      const datasetType = e.target.dataset.type;
      const datasetValue = parseFloat(e.target.value);
      const calculatorRowKeys =
        savedCalculator[calculatorListIndex].template[calculatorRowIndex];

      for (const key in calculatorRowKeys) {
        if (datasetType === key) {
          key.value = savedCalculator[calculatorListIndex].template[
            calculatorRowIndex
          ][key] = datasetValue;
        }
      }
      localStorage.setItem("calculator", JSON.stringify(savedCalculator));
    } else if (action === "updateUnitTypeValues") {
      let calculatorListItems = Array.from(calculatorList.children);

      calculatorListItems.forEach((listItem, listItemIndex) => {
        let rows = Array.from(listItem.querySelector("ul").children);

        rows.forEach((row, rowIndex) => {
          let conversionRow = row.querySelector(
            `[data-unit="${settings.unitName()}"]`
          );
          if (conversionRow) {
            let inputs = conversionRow.querySelectorAll("[data-calculate]");

            Array.from(inputs).forEach((input) => {
              let calculatorRowKeys =
                savedCalculator[listItemIndex].template[rowIndex];
              for (const key in calculatorRowKeys) {
                if (input.dataset.type === key) {
                  key.value = savedCalculator[listItemIndex].template[rowIndex][
                    key
                  ] = parseFloat(input.value);
                }
              }
            });
          }
        });
      });
      localStorage.setItem("calculator", JSON.stringify(savedCalculator));

      // get all local storage templates with their given index
    } else if (action === "updateName") {
      const calculatorItem = e.target.closest("li"),
        calculatorParentItem = calculatorItem.parentNode,
        calculatorListIndex = Array.from(calculatorParentItem.children).indexOf(
          calculatorItem
        );

      savedCalculator[calculatorListIndex].name = e.target.value.trim();
      localStorage.setItem("calculator", JSON.stringify(savedCalculator));
    } else if (action === "reset") {
      calculator.setLocalStorage();
    }
    calculator.calculateTotal();
  },
  init: () => {
    settings.initLocalStorage();
    calculator.getLocalStorage();
    calculator.calculateTotal();

    // handle global change events
    document.addEventListener("change", (e) => {
      const el = e.target;
      const setting = e.target.dataset.setting;

      if (el && el.dataset.calculate) {
        //calculator.convertRow(e);
        calculator.updateLocalStorage(e, "update");
        parseFloat(el.value) > 0
          ? el.classList.remove("is-faded")
          : el.classList.add("is-faded");
      }
      if (setting) {
        switch (setting) {
          case "metric":
            el.checked ? (settings.metric = true) : (settings.metric = false);
            calculator.convertRows();
            document.body.className = `is-${settings.unitName()}`;
            calculator.updateLocalStorage(e, "updateUnitTypeValues");
            break;
          case "bagSize":
            settings.deliverMessage(e, "bag size change");
            break;
          case "costPerBag":
            if (costPerBag.value !== "") {
              costPerBag.value = twoDecimals(costPerBag.value);
            }
            settings.deliverMessage(e, "cost per bag change");
            break;
          case "wastePercentage":
            wastePercentageAmount = (wastePercentage.value / 100 + 1).toFixed(
              2
            );
            settings.deliverMessage(e, "waste percentage change");
            break;
          default:
            return;
        }
        calculator.calculateTotal();
        settings.updateLocalStorage();
      }
    });

    // handle global click events
    document.addEventListener("click", (e) => {
      const action = e.target.dataset.action;
      if (action) {
        switch (action) {
          case "create":
            createItem(e);
            break;
          case "remove":
            removeItem(e);
            break;
          case "reset":
            resetCalculatorListItems(e);
            break;
          default:
            return;
        }
      }
    });

    // store name value temporarily to determine if name changed
    let nameValue = "";

    // handle global focus events
    document.addEventListener(
      "focus",
      (e) => {
        const action = e.target.dataset.action;
        if (action === "updateName") {
          nameValue = e.target.value.trim();
        }
      },
      true
    );

    // handle global blur events
    document.addEventListener(
      "blur",
      (e) => {
        const action = e.target.dataset.action;
        if (action === "updateName") {
          e.target.value = e.target.value.trim();
        }
        if (action === "updateName" && e.target.value.trim() !== nameValue) {
          calculator.updateLocalStorage(e, "updateName");
          settings.deliverMessage(e, "update name");
        }
      },
      true
    );
  }
};

const createItem = (e) => {
  const type = e.target.nextSibling.firstChild.dataset.type;
  appendTemplate(type);
  if (calculatorList.children.length) {
    empty.style.display = "none";
  }
  calculator.updateLocalStorage(e, "create");
  calculator.calculateTotal();
  settings.deliverMessage(e, "create");
};

const removeItem = (e) => {
  const parentListItem = e.target.closest("li");
  calculator.updateLocalStorage(e, "remove");
  parentListItem.remove();
  if (!calculatorList.children.length) {
    empty.style.display = "block";
  }
  calculator.calculateTotal();
  settings.deliverMessage(e, "remove");
};

const resetCalculatorListItems = (e) => {
  calculator.updateLocalStorage(e, "reset");
  calculatorList.innerHTML = "";
  if (calculator.type !== "main") {
    appendTemplate(calculator.type);
    calculator.setLocalStorage();
    empty.style.display = "none";
  } else {
    empty.style.display = "block";
  }

  calculator.calculateTotal();
  document.body.scrollTop = document.documentElement.scrollTop = 0;
  settings.deliverMessage(e, "reset");
};

calculator.init();

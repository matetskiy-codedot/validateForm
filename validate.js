class Formik {
  constructor(selector = "#form-add-card", options) {
    this.selector = selector;
    let defaultOptions = {
      initialValue: {},
      rules: {},
      onSubmit: () => {},
    };

    this.options = Object.assign(defaultOptions, options);
    this.values = this.options.initialValue;

    this.onSubmit = this.options.onSubmit;
    this.init();
  }

  handleSubmit(e) {
    e.preventDefault();

    for (let value in this.options.initialValue) {
      if (this.values.hasOwnProperty(value)) {
        let obj = document.getElementById(value);

        if (!this.options.rules[value]?.mask) {
          if (obj.getAttribute("type") === "checkbox") {
            this.values[value] = obj.checked;
          } else {
            if (obj.value.length > 0) this.values[value] = obj.value;
            else return;
          }
        }
        if (!this.values[value].length && this.options.rules[value].required) return;
      }
    }

    this.onSubmit(e, this.values);
  }

  check(e) {
    const value = e.target.value;
    const key = e.target.id;
    const rule = this.options.rules[key];
    let valueCounter = 0;
    let newValue = "";

    let insert = (value, counter = 0) => {
      newValue += value;
      valueCounter += counter;
    };

    if (rule.mask) {
      if (e.inputType == "deleteContentBackward" || e.inputType == "deleteContentForward") {
        let i = 1;

        while (
          rule.mask[value.length - i] != "9" &&
          rule.mask[value.length - i] != "M" &&
          rule.mask[value.length - i] != "Y" &&
          value.length > i
        ) {
          i++;
        }

        e.target.value = value.slice(0, value.length - (i - 1));
        if (value.length != rule.mask.length) this.values[key] = "";
        return;
      }

      if (!/^\d+$/.test(e.data)) {
        let index = value.indexOf(e.data);
        e.target.value = value.slice(0, index) + value.slice(index + 1, value.length);
        return;
      }

      for (let i = 0; i < rule.mask.length; i++) {
        if (rule.mask[i] != "9") {
          if (rule.mask[i] == "M") {
            if (typeof value[valueCounter] == "undefined") break;
            if (rule.mask[i + 1] === "M" && value[valueCounter] < 2) {
              insert(value[valueCounter], 1);
              continue;
            }

            if (rule.mask[i - 1] === "M") {
              if (
                newValue[valueCounter - 1] === "0" &&
                value[valueCounter] < 10 &&
                value[valueCounter] > 0
              ) {
                insert(value[valueCounter], 1);
                continue;
              }

              if (newValue[i - 1] === "1" && value[valueCounter] < 3) {
                insert(value[valueCounter], 1);
                continue;
              }
            }
            break;
          } else if (rule.mask[i] == "Y") {
            if (typeof value[valueCounter] == "undefined") break;
            insert(value[valueCounter], 1);
          } else {
            insert(rule.mask[i], 1);
            continue;
          }
        }

        if (value.length == 1) {
          if (rule.mask[i] === "9") {
            insert(value[0]);
            break;
          }
        } else {
          if (rule.mask[i] === "9") {
            if (typeof value[valueCounter] == "undefined") break;
            insert(value[valueCounter], 1);
            continue;
          }
        }
      }

      if (newValue.length == rule.mask.length) this.values[key] = newValue;
      e.target.value = newValue;
    }
  }

  init() {
    const formElem = document.querySelector(this.selector);
    if (!formElem) return;
    formElem.addEventListener("submit", this.handleSubmit.bind(this));
    for (let key in this.values) {
      const inputElem = document.getElementById(key);

      if (!this.options.rules[key] || !inputElem) continue;
      inputElem.addEventListener("input", (e) => {
        this.check(e);
      });
    }
  }
}

Object.prototype.Formik = Formik;

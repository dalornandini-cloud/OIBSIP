// DOM references are grouped here so the conversion logic stays easy to follow.
const form = document.querySelector("#converter-form");
const temperatureInput = document.querySelector("#temperature");
const unitSelect = document.querySelector("#unit");
const errorMessage = document.querySelector("#input-error");
const resultsSection = document.querySelector("#results");
const formulaLine = document.querySelector("#formula-line");
const resetButton = document.querySelector("#reset-button");

const resultFields = {
  celsius: document.querySelector("#result-celsius"),
  fahrenheit: document.querySelector("#result-fahrenheit"),
  kelvin: document.querySelector("#result-kelvin")
};

const resultCards = document.querySelectorAll(".result-card");
const MAX_ABSOLUTE_INPUT = 1_000_000;

const UNIT_DETAILS = {
  celsius: {
    name: "Celsius",
    symbol: "°C",
    formula: "°F = (°C × 9/5) + 32 · K = °C + 273.15"
  },
  fahrenheit: {
    name: "Fahrenheit",
    symbol: "°F",
    formula: "°C = (°F − 32) × 5/9 · K = (°F − 32) × 5/9 + 273.15"
  },
  kelvin: {
    name: "Kelvin",
    symbol: "K",
    formula: "°C = K − 273.15 · °F = (K − 273.15) × 9/5 + 32"
  }
};

// Keep formulas independently reusable and convert through Celsius for consistency.
function celsiusToFahrenheit(celsius) {
  return (celsius * 9 / 5) + 32;
}

function celsiusToKelvin(celsius) {
  return celsius + 273.15;
}

function fahrenheitToCelsius(fahrenheit) {
  return (fahrenheit - 32) * 5 / 9;
}

function fahrenheitToKelvin(fahrenheit) {
  return fahrenheitToCelsius(fahrenheit) + 273.15;
}

function kelvinToCelsius(kelvin) {
  return kelvin - 273.15;
}

function kelvinToFahrenheit(kelvin) {
  return celsiusToFahrenheit(kelvinToCelsius(kelvin));
}

function inputToCelsius(value, unit) {
  if (unit === "fahrenheit") {
    return fahrenheitToCelsius(value);
  }
  if (unit === "kelvin") {
    return kelvinToCelsius(value);
  }
  return value;
}

function convertTemperature(value, unit) {
  const celsius = inputToCelsius(value, unit);
  return {
    celsius,
    fahrenheit: celsiusToFahrenheit(celsius),
    kelvin: celsiusToKelvin(celsius)
  };
}

// Compare in the selected input scale so exact absolute-zero values remain valid.
function checkAbsoluteZero(value, unit) {
  const minimums = {
    celsius: -273.15,
    fahrenheit: -459.67,
    kelvin: 0
  };

  return value >= minimums[unit];
}

function showError(message) {
  errorMessage.textContent = message;
  temperatureInput.classList.remove("is-valid");
  temperatureInput.classList.add("is-invalid");
  temperatureInput.setAttribute("aria-invalid", "true");
}

function clearError() {
  errorMessage.textContent = "";
  temperatureInput.classList.remove("is-invalid");
  temperatureInput.setAttribute("aria-invalid", "false");
}

function validateInput() {
  const rawValue = temperatureInput.value.trim();
  const numericPattern = /^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/;

  if (rawValue === "") {
    showError("Please enter a temperature.");
    return null;
  }

  if (!numericPattern.test(rawValue)) {
    showError("Enter a valid number, such as 36.6 or -40.");
    return null;
  }

  const value = Number(rawValue);
  if (!Number.isFinite(value)) {
    showError("That number is too large to convert. Please enter a smaller value.");
    return null;
  }

  if (Math.abs(value) > MAX_ABSOLUTE_INPUT) {
    showError(`Please enter a temperature between -${MAX_ABSOLUTE_INPUT.toLocaleString()} and ${MAX_ABSOLUTE_INPUT.toLocaleString()}.`);
    return null;
  }

  if (!checkAbsoluteZero(value, unitSelect.value)) {
    showError("Temperature cannot be below absolute zero (-273.15°C / -459.67°F / 0 K).");
    return null;
  }

  clearError();
  temperatureInput.classList.add("is-valid");
  return value;
}

function formatResult(value) {
  const rounded = Math.round((value + Number.EPSILON) * 100) / 100;
  return Object.is(rounded, -0) ? "0.00" : rounded.toFixed(2);
}

function displayResults(temperatures, sourceUnit) {
  for (const [unit, field] of Object.entries(resultFields)) {
    field.textContent = formatResult(temperatures[unit]);
  }

  resultCards.forEach((card) => {
    card.classList.toggle("is-source", card.dataset.resultUnit === sourceUnit);
  });

  formulaLine.textContent = `Formula: ${UNIT_DETAILS[sourceUnit].formula}`;
  resultsSection.hidden = false;
}

function hideResults() {
  resultsSection.hidden = true;
  resultCards.forEach((card) => card.classList.remove("is-source"));
}

function resetForm() {
  form.reset();
  clearError();
  temperatureInput.classList.remove("is-valid");
  hideResults();
  errorMessage.textContent = "";
}

temperatureInput.addEventListener("input", () => {
  hideResults();
  validateInput();
});

unitSelect.addEventListener("change", () => {
  hideResults();
  validateInput();
});

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const value = validateInput();
  if (value === null) {
    hideResults();
    return;
  }

  displayResults(convertTemperature(value, unitSelect.value), unitSelect.value);
});

resetButton.addEventListener("click", resetForm);

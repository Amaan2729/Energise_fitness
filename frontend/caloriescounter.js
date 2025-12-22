// Selectors
const form = document.getElementById('calorieForm');
const mealTypeSelect = document.getElementById('mealType');
const mealInput = document.getElementById('meal');
const caloriesInput = document.getElementById('calories');

// Elements for displaying calories
const breakfastCaloriesDisplay = document.getElementById('breakfastCalories');
const brunchCaloriesDisplay = document.getElementById('brunchCalories');
const lunchCaloriesDisplay = document.getElementById('lunchCalories');
const snacksCaloriesDisplay = document.getElementById('snacksCalories');
const dinnerCaloriesDisplay = document.getElementById('dinnerCalories');
const totalCaloriesDisplay = document.getElementById('totalCalories');
// Aarnav added this comment to test the PR workflow.
// Calorie counters for each meal
let breakfastCalories = 0;
let brunchCalories = 0;
let lunchCalories = 0;
let snacksCalories = 0;
let dinnerCalories = 0;
let totalCalories = 0;

// Event listener to handle form submission
form.addEventListener('submit', (e) => {
  e.preventDefault();

  const mealType = mealTypeSelect.value;
  const mealDescription = mealInput.value.trim();
  const calories = parseInt(caloriesInput.value);

  // Validate input
  if (mealDescription === '' || isNaN(calories) || calories <= 0) {
    alert('Please enter a valid meal description and calorie amount.');
    return;
  }

  // Add calories to the selected meal type
  addCaloriesToMealType(mealType, calories);

  // Clear input fields after submission
  mealInput.value = '';
  caloriesInput.value = '';
});

// Function to add calories to the selected meal type
function addCaloriesToMealType(mealType, calories) {
  switch (mealType) {
    case 'breakfast':
      breakfastCalories += calories;
      updateCaloriesDisplay(breakfastCaloriesDisplay, breakfastCalories);
      break;
    case 'brunch':
      brunchCalories += calories;
      updateCaloriesDisplay(brunchCaloriesDisplay, brunchCalories);
      break;
    case 'lunch':
      lunchCalories += calories;
      updateCaloriesDisplay(lunchCaloriesDisplay, lunchCalories);
      break;
    case 'snacks':
      snacksCalories += calories;
      updateCaloriesDisplay(snacksCaloriesDisplay, snacksCalories);
      break;
    case 'dinner':
      dinnerCalories += calories;
      updateCaloriesDisplay(dinnerCaloriesDisplay, dinnerCalories);
      break;
    default:
      break;
  }

  // Update total calories
  totalCalories += calories;
  updateCaloriesDisplay(totalCaloriesDisplay, totalCalories);
}

// Function to update the displayed calorie count
function updateCaloriesDisplay(element, calories) {
  element.textContent = calories;
}


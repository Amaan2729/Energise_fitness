// Define diet plans for veg and non-veg with nutrient information
const dietPlans = {
    veg: {
      breakfast: [
        {
          meal: 'Oatmeal with fruits',
          nutrients: { protein: '10g', vitamins: 'Vitamin A, C', minerals: 'Iron, Calcium' }
        },
        {
          meal: 'Veggie Smoothie',
          nutrients: { protein: '7g', vitamins: 'Vitamin B, C', minerals: 'Magnesium, Potassium' }
        }
      ],
      lunch: [
        {
          meal: 'Grilled Veggie Wrap',
          nutrients: { protein: '12g', vitamins: 'Vitamin A, B', minerals: 'Iron, Zinc' }
        },
        {
          meal: 'Chickpea Salad',
          nutrients: { protein: '15g', vitamins: 'Vitamin C, K', minerals: 'Calcium, Iron' }
        }
      ],
      snacks: [
        {
          meal: 'Mixed Nuts',
          nutrients: { protein: '6g', vitamins: 'Vitamin E', minerals: 'Magnesium, Zinc' }
        },
        {
          meal: 'Fruit Salad',
          nutrients: { protein: '2g', vitamins: 'Vitamin C', minerals: 'Potassium, Fiber' }
        }
      ],
      dinner: [
        {
          meal: 'Vegetable Stir Fry with Tofu',
          nutrients: { protein: '18g', vitamins: 'Vitamin A, K', minerals: 'Iron, Calcium' }
        },
        {
          meal: 'Lentil Soup',
          nutrients: { protein: '16g', vitamins: 'Vitamin B', minerals: 'Iron, Magnesium' }
        }
      ]
    },
    nonveg: {
      breakfast: [
        {
          meal: 'Scrambled Eggs with Avocado',
          nutrients: { protein: '15g', vitamins: 'Vitamin B, D', minerals: 'Zinc, Selenium' }
        },
        {
          meal: 'Greek Yogurt with Berries',
          nutrients: { protein: '12g', vitamins: 'Vitamin C, B12', minerals: 'Calcium, Magnesium' }
        }
      ],
      lunch: [
        {
          meal: 'Grilled Chicken Salad',
          nutrients: { protein: '25g', vitamins: 'Vitamin A, C', minerals: 'Iron, Potassium' }
        },
        {
          meal: 'Salmon with Quinoa',
          nutrients: { protein: '30g', vitamins: 'Vitamin D, B12', minerals: 'Omega-3, Iron' }
        }
      ],
      snacks: [
        {
          meal: 'Boiled Eggs',
          nutrients: { protein: '6g', vitamins: 'Vitamin B12', minerals: 'Iron, Zinc' }
        },
        {
          meal: 'Turkey Jerky',
          nutrients: { protein: '12g', vitamins: 'Vitamin B6', minerals: 'Sodium, Potassium' }
        }
      ],
      dinner: [
        {
          meal: 'Grilled Steak with Vegetables',
          nutrients: { protein: '35g', vitamins: 'Vitamin B12', minerals: 'Iron, Zinc' }
        },
        {
          meal: 'Chicken Stir Fry',
          nutrients: { protein: '30g', vitamins: 'Vitamin C, B', minerals: 'Iron, Magnesium' }
        }
      ]
    }
  };
  
  // Handle form submission
  document.getElementById('dietChoiceForm').addEventListener('submit', function(event) {
    event.preventDefault();
    
    // Get the diet type (veg or nonveg) from user input
    const dietType = document.getElementById('dietType').value;
    if (!dietType) {
      alert('Please select a diet type!');
      return;
    }
    
    // Display the diet chart section
    document.getElementById('dietChartSection').style.display = 'block';
    
    // Display the diet plan
    displayDietPlan(dietType);
  });
  
  // Function to display the diet plan
  function displayDietPlan(dietType) {
    const dietPlan = dietPlans[dietType];
    const dietPlanContainer = document.getElementById('dietPlan');
    dietPlanContainer.innerHTML = ''; // Clear previous content
    
    // Loop through each meal time (breakfast, lunch, snacks, dinner)
    for (let mealTime in dietPlan) {
      const mealData = dietPlan[mealTime][0]; // Default meal
      const alternativeMeal = dietPlan[mealTime][1]; // Alternative meal
      
      // Create the meal card
      const mealCard = document.createElement('div');
      mealCard.classList.add('meal-card');
      
      // Meal title
      const mealTitle = document.createElement('h4');
      mealTitle.textContent = mealTime.charAt(0).toUpperCase() + mealTime.slice(1);
      mealCard.appendChild(mealTitle);
      
      // Meal description
      const mealDescription = document.createElement('p');
      mealDescription.textContent = `Meal: ${mealData.meal}`;
      mealCard.appendChild(mealDescription);
      
      // Nutrient information
      const nutrientList = document.createElement('ul');
      nutrientList.classList.add('meal-nutrients');
      
      for (let nutrient in mealData.nutrients) {
        const nutrientItem = document.createElement('li');
        nutrientItem.textContent = `${nutrient.charAt(0).toUpperCase() + nutrient.slice(1)}: ${mealData.nutrients[nutrient]}`;
        nutrientList.appendChild(nutrientItem);
      }
      
      mealCard.appendChild(nutrientList);
      
      // Alternative meal button
      const altMealButton = document.createElement('button');
      altMealButton.textContent = 'Show Alternative Meal';
      altMealButton.classList.add('btn', 'btn-secondary', 'btn-sm', 'mt-2');
      
      // Handle alternative meal click event
      altMealButton.addEventListener('click', function() {
        mealDescription.textContent = `Meal: ${alternativeMeal.meal}`;
        nutrientList.innerHTML = ''; // Clear previous nutrients
        
        for (let nutrient in alternativeMeal.nutrients) {
          const nutrientItem = document.createElement('li');
          nutrientItem.textContent = `${nutrient.charAt(0).toUpperCase() + nutrient.slice(1)}: ${alternativeMeal.nutrients[nutrient]}`;
          nutrientList.appendChild(nutrientItem);
        }
      });
      
      mealCard.appendChild(altMealButton);
      
      // Append meal card to the diet plan container
      dietPlanContainer.appendChild(mealCard);
    }
  }
  
  
  
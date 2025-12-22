const form = document.querySelector('form');
const resetBtn = document.querySelector('#reset-btn');
form.addEventListener('submit', function (e) {
    e.preventDefault();
    
    const height = parseInt(document.querySelector('#height').value);
    const weight = parseInt(document.querySelector('#weight').value);
    const results = document.querySelector('#results');

    // Input validation for height and weight
    if (isNaN(height) || height <= 0) {
        results.innerHTML = `Please provide a valid height.`;
    } else if (isNaN(weight) || weight <= 0) {
        results.innerHTML = `Please provide a valid weight.`;
    } else {
        // BMI Calculation
        const bmi = (weight / ((height / 100) ** 2)).toFixed(2);

        // Display BMI result and categories
        results.innerHTML = `<h3>Your BMI is ${bmi}</h3>`;

        if (bmi < 18.6) {
            results.innerHTML += `<p>You are underweight.</p>`;
        } else if (bmi >= 18.6 && bmi <= 24.9) {
            results.innerHTML += `<p>You are in the normal range.</p>`;
        } else {
            results.innerHTML += `<p>You are overweight.</p>`;
        }
    }
});

resetBtn.addEventListener('click', function () {
    document.querySelector('#height').value = '';
    document.querySelector('#weight').value = '';
    document.querySelector('#results').innerHTML = '';
});


    

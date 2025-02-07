document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('calculatorForm');
    
    if (form) {
        form.addEventListener('submit', function(e) {
            const inputs = form.querySelectorAll('input[type="number"]');
            let valid = true;
            
            inputs.forEach(input => {
                if (input.value === '') {
                    valid = false;
                    input.classList.add('is-invalid');
                } else {
                    input.classList.remove('is-invalid');
                }
            });
            
            if (!valid) {
                e.preventDefault();
                alert('Please fill in all fields');
                return;
            }
        });

        // Add input validation for numerical ranges
        inputs.forEach(input => {
            input.addEventListener('input', function() {
                const value = parseFloat(this.value);
                const min = parseFloat(this.getAttribute('min') || '-Infinity');
                const max = parseFloat(this.getAttribute('max') || 'Infinity');

                if (value < min || value > max) {
                    this.classList.add('is-invalid');
                    this.nextElementSibling.textContent = `Value must be between ${min} and ${max}`;
                } else {
                    this.classList.remove('is-invalid');
                }
            });
        });
    }
});
// Visitor counter
document.addEventListener('DOMContentLoaded', () => {
    // Get the visitor counter element
    const visitorCounter = document.querySelector('.visitor-counter');
    
    // Get the current count from localStorage or initialize it
    let count = localStorage.getItem('visitorCount');
    if (!count) {
        count = 0;
    }
    
    // Increment the count
    count++;
    
    // Save the new count to localStorage
    localStorage.setItem('visitorCount', count);
    
    // Update the display
    visitorCounter.textContent = `You are visitor number ${count}`;
});

// Training Schedule Data
const trainingSchedule = {
    monday: {
        morning: "HIIT / Core 45 mins or easy run",
        note: "*skip if tired"
    },
    tuesday: {
        morning: "Strength 45 mins + 300 wall balls (volume) 9KG / 6KG 15 mins"
    },
    wednesday: {
        morning: "Hyrox (wall balls) / running 45mins"
    },
    thursday: {
        morning: "Strength 45 mins + 100 wall balls (time) 9KG 7 mins + 100 for time 6kg"
    },
    friday: {
        morning: "AM Run -threshold 1 hr",
        evening: "PM Row threshold 45 mins"
    },
    saturday: {
        morning: "Tennis lesson + doubles 1-2 hrs",
        evening: "Core 20 mins"
    },
    sunday: {
        morning: "Hyrox (wall balls) / running 90mins"
    }
};

// Supplement Stack Data
const supplementStack = {
    morning: [
        { name: "Taurine", dosage: "1000mg", purpose: "Supports muscle contraction, endurance, hydration, and electrolyte balance" },
        { name: "Beta-Alanine", dosage: "2g (split dose)", purpose: "Increases carnosine levels, helps buffer acid buildup in muscles" }
    ],
    preworkout: [
        { name: "Citrulline Malate", dosage: "4g", purpose: "Boosts nitric oxide production, improves blood flow", note: "*only on high intensity days" },
        { name: "Beta-Alanine", dosage: "2g (2nd half of split dose)", purpose: "Increases carnosine levels" },
        { name: "Beetroot Extract", dosage: "3000mg", purpose: "Contains nitrates, improves VO2 max and endurance" }
    ],
    recovery: [
        { name: "Whey Protein (Grass-Fed)", dosage: "30g", purpose: "High-quality protein for muscle repair" },
        { name: "Creatine Monohydrate", dosage: "5g", purpose: "Improves power output and muscle recovery" },
        { name: "Himalayan Pink Salt", dosage: "1/4 tsp", purpose: "Replenishes electrolytes" },
        { name: "Coconut Water", dosage: "1/2 cup", purpose: "Natural source of potassium" }
    ],
    sleep: [
        { name: "Montmorency Cherry", dosage: "1000mg", purpose: "Natural source of melatonin" },
        { name: "Saffron", dosage: "28mg", purpose: "Supports mood and sleep quality", note: "*every other day" },
        { name: "L-Theanine", dosage: "200mg", purpose: "Promotes relaxation without sedation" },
        { name: "Magnesium Glycinate", dosage: "300mg", purpose: "Crucial for muscle relaxation and sleep", note: "*every other day" }
    ]
};

// Recovery Smoothie Recipe
const smoothieRecipes = {
    electrolyte: {
        ingredients: [
            { name: "Coconut Water", amount: "1/2 cup" },
            { name: "Himalayan Pink Salt", amount: "1/4 tsp" },
            { name: "Lemon Juice", amount: "1 whole lemon" },
            { name: "Honey", amount: "1 tbsp" },
            { name: "Water", amount: "1/2 cup (or more)" }
        ],
        benefits: "Perfect for hydration and electrolyte balance"
    },
    recovery: {
        ingredients: [
            { name: "Whey Protein (Grass-Fed)", amount: "30g" },
            { name: "Pineapple Chunks", amount: "1/2 cup" },
            { name: "Coconut Water", amount: "1/2 cup" },
            { name: "Honey", amount: "1 tbsp" },
            { name: "Creatine Monohydrate", amount: "5g" }
        ],
        benefits: "Optimal for post-workout recovery and muscle repair"
    }
};

// Tab Functionality
function initializeTabs() {
    // Training Schedule Tabs
    const scheduleTabs = document.querySelectorAll('.schedule-tabs .tab-button');
    const scheduleContent = document.querySelector('.schedule-content');

    scheduleTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const day = tab.dataset.day;
            const schedule = trainingSchedule[day];
            
            // Update active tab
            scheduleTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            // Update content
            let content = `<div class="day-schedule">`;
            if (schedule.morning) {
                content += `<div class="schedule-item"><strong>Morning:</strong> ${schedule.morning}</div>`;
            }
            if (schedule.evening) {
                content += `<div class="schedule-item"><strong>Evening:</strong> ${schedule.evening}</div>`;
            }
            if (schedule.note) {
                content += `<div class="schedule-note">${schedule.note}</div>`;
            }
            content += `</div>`;
            scheduleContent.innerHTML = content;
        });
    });

    // Supplement Stack Tabs
    const supplementTabs = document.querySelectorAll('.supplement-tabs .tab-button');
    const supplementContent = document.querySelector('.supplement-content');

    supplementTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const stackType = tab.dataset.stack;
            let supplements;
            
            switch(stackType) {
                case 'sleep':
                    supplements = supplementStack.sleep;
                    break;
                case 'recovery':
                    supplements = supplementStack.recovery;
                    break;
                case 'performance':
                    supplements = [...supplementStack.morning, ...supplementStack.preworkout];
                    break;
            }

            // Update active tab
            supplementTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            // Update content
            let content = `<div class="supplement-list">`;
            supplements.forEach(supp => {
                content += `
                    <div class="supplement-item">
                        <h4>${supp.name}</h4>
                        <div class="dosage">${supp.dosage}</div>
                        <div class="purpose">${supp.purpose}</div>
                        ${supp.note ? `<div class="note">${supp.note}</div>` : ''}
                    </div>
                `;
            });
            content += `</div>`;
            supplementContent.innerHTML = content;
        });
    });

    // Smoothie Recipe Tabs
    const smoothieTabs = document.querySelectorAll('.smoothie-tabs .tab-button');
    const smoothieContent = document.querySelector('.smoothie-content');

    smoothieTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const smoothieType = tab.dataset.smoothie;
            const recipe = smoothieRecipes[smoothieType];

            // Update active tab
            smoothieTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            // Update content
            let content = `
                <div class="smoothie-recipe">
                    <div class="ingredients">
                        <h4>Ingredients:</h4>
                        <ul>
                            ${recipe.ingredients.map(ing => `
                                <li><span class="ingredient">${ing.name}</span> - ${ing.amount}</li>
                            `).join('')}
                        </ul>
                    </div>
                    <div class="benefits">${recipe.benefits}</div>
                </div>
            `;
            smoothieContent.innerHTML = content;
        });
    });
}

// Initialize tabs when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    initializeTabs();
    // Trigger click on initial active tabs
    document.querySelector('.schedule-tabs .tab-button.active').click();
    document.querySelector('.supplement-tabs .tab-button.active').click();
    document.querySelector('.smoothie-tabs .tab-button.active').click();
}); 
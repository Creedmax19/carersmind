document.addEventListener('DOMContentLoaded', function() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    const communityCards = document.querySelectorAll('.community-card');

    // Show all cards by default
    showAllCards();

    // Add click event listeners to filter buttons
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class from all buttons
            filterButtons.forEach(btn => btn.classList.remove('active'));
            // Add active class to clicked button
            this.classList.add('active');
            
            const filter = this.getAttribute('data-filter');
            
            // Show all cards if 'All' is clicked
            if (filter === 'all') {
                showAllCards();
                return;
            }
            
            // Filter cards based on category
            communityCards.forEach(card => {
                if (card.getAttribute('data-category') === filter) {
                    card.style.display = 'block';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    });
    
    // Function to show all cards
    function showAllCards() {
        communityCards.forEach(card => {
            card.style.display = 'block';
        });
    }
});

document.addEventListener('DOMContentLoaded', () => {
    const buttons = document.querySelectorAll('.task-btn');

    buttons.forEach(button => {
        const target = button.dataset.target;
        button.addEventListener('click', () => {
            location.href = target;
        });
    });
});

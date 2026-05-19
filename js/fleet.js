/* Fleet page JS - card interactions */
document.addEventListener('DOMContentLoaded', () => {
  const cards = document.querySelectorAll('.fleet-card');
  
  cards.forEach(card => {
    card.addEventListener('click', (e) => {
      if (e.target.closest('.btn')) return; // don't toggle on button clicks
      cards.forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
    });
  });

  // Hover effect on table rows
  const rows = document.querySelectorAll('.comparison-table tbody tr');
  rows.forEach(row => {
    row.addEventListener('mouseenter', () => {
      row.style.background = 'rgba(0,212,255,0.03)';
    });
    row.addEventListener('mouseleave', () => {
      row.style.background = '';
    });
  });
});

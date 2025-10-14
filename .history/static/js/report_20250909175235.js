// Bar Chart
const barCtx = document.getElementById('barChart').getContext('2d');
let period = 'daily';
const barData = {
  daily: [120, 150, 100, 180, 140, 160, 130],
  weekly: [850, 900, 880, 920],
  monthly: [3200, 3500, 3400]
};
const barChart = new Chart(barCtx, {
  type: 'bar',
  data: {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [{
      label: 'Visitor Logs',
      data: barData.daily,
      backgroundColor: '#4A90E2'
    }]
  },
  options: {
    responsive: true,
    plugins: {
      tooltip: { enabled: true }
    }
  }
});

document.querySelectorAll('.btn-chart-toggle').forEach(btn => {
  btn.addEventListener('click', (e) => {
    period = e.target.dataset.period;
    const labels = period === 'daily'
      ? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
      : (period === 'weekly'
        ? ['Week 1', 'Week 2', 'Week 3', 'Week 4']
        : ['Jan', 'Feb', 'Mar']);
    barChart.data.labels = labels;
    barChart.data.datasets[0].data = barData[period];
    barChart.update();
  });
});

// Horizontal Stacked Bar
const horCtx = document.getElementById('horizontalChart').getContext('2d');
new Chart(horCtx, {
  type: 'bar',
  data: {
    labels: ['Delivery', 'Guest', 'Service', 'Other'],
    datasets: [{
      label: 'Purpose',
      data: [200, 150, 100, 50],
      backgroundColor: ['#7ED321', '#F5A623', '#4A90E2', '#D0021B']
    }]
  },
  options: {
    indexAxis: 'y',
    responsive: true
  }
});

// Pie Chart
const pieCtx = document.getElementById('pieChart').getContext('2d');
new Chart(pieCtx, {
  type: 'pie',
  data: {
    labels: ['Car', 'Motorcycle', 'Bicycle', 'Other'],
    datasets: [{
      data: [500, 300, 100, 100],
      backgroundColor: ['#4A90E2', '#7ED321', '#F5A623', '#D0021B']
    }]
  },
  options: {
  responsive: true,
  maintainAspectRatio: true, // ✅ make chart scale with zoom
  ...
}

// Access Points Chart
const accCtx = document.getElementById('accessChart').getContext('2d');
new Chart(accCtx, {
  type: 'bar',
  data: {
    labels: ['Gate 1', 'Gate 2'],
    datasets: [{
      label: 'Entries',
      data: [250, 200],
      backgroundColor: '#7ED321'
    }]
  },
  options: { responsive: true }
});

// Export buttons (placeholder)
document.querySelectorAll('.btn-export, .btn-green').forEach(btn => {
  if (btn.classList.contains('btn-export')) {
    btn.style.display = 'inline-block';
  }
  btn.addEventListener('click', () => {
    alert('Export functionality coming soon!');
  });
});

// Filter button
document.querySelector('.btn-filter').addEventListener('click', () => {
  alert('Filter modal or functionality here!');
});

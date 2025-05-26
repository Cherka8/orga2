import React from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
// Import pour la traduction
import { useTranslation } from 'react-i18next';

// Enregistrer les composants nécessaires de Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const ActorHoursChart = ({ actorsData }) => {
  const { t } = useTranslation(); // Hook de traduction

  // Palette de couleurs moderne et harmonieuse
  const gradientColors = [
    'rgba(79, 70, 229, 0.8)',   // Indigo (couleur principale du site)
    'rgba(59, 130, 246, 0.8)',  // Bleu
    'rgba(16, 185, 129, 0.8)',  // Vert émeraude
    'rgba(245, 158, 11, 0.8)',  // Ambre
    'rgba(239, 68, 68, 0.8)',   // Rouge
  ];

  // Préparer les données pour le graphique
  const chartData = {
    labels: actorsData.map(actor => `${actor.firstName} ${actor.lastName}`),
    datasets: [
      {
        label: t('actorHoursChart.datasetLabel'), // Utiliser la traduction
        data: actorsData.map(actor => actor.totalHours / (1000 * 60 * 60)), // Convertir ms en heures
        backgroundColor: actorsData.map((_, index) => gradientColors[index % gradientColors.length]),
        borderColor: actorsData.map((_, index) => gradientColors[index % gradientColors.length].replace('0.8', '1')),
        borderWidth: 1,
        borderRadius: 6,
        maxBarThickness: 50,
      },
    ],
  };

  // Configurer les options du graphique - Optimisé pour tablette
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    devicePixelRatio: 2, // Meilleure résolution sur les écrans haute densité
    plugins: {
      legend: {
        display: false, // Masquer la légende car les noms sont déjà sur l'axe X
      },
      title: {
        display: true,
        text: t('actorHoursChart.title'), // Utiliser la traduction
        font: {
          size: 18, // Taille de police plus grande pour les tablettes
          weight: 'bold',
          family: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
        },
        padding: {
          top: 15,
          bottom: 25
        },
        color: '#111827',
      },
      tooltip: {
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        titleColor: '#111827',
        bodyColor: '#4b5563',
        titleFont: {
          size: 16, // Taille de police plus grande pour les tablettes
          weight: 'bold',
          family: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
        },
        bodyFont: {
          size: 15, // Taille de police plus grande pour les tablettes
          family: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
        },
        padding: 16, // Plus grand padding pour les interactions tactiles
        boxPadding: 8,
        borderColor: '#e5e7eb',
        borderWidth: 1,
        cornerRadius: 10,
        displayColors: true,
        boxWidth: 12, // Plus grand pour les interactions tactiles
        boxHeight: 12, // Plus grand pour les interactions tactiles
        usePointStyle: true,
        enabled: true,
        mode: 'nearest',
        intersect: true,
        callbacks: {
          label: function(context) {
            let label = '';
            if (context.parsed.y !== null) {
              // Afficher les heures avec une décimale
              label = context.parsed.y.toFixed(1) + ' ' + t('actorHoursChart.tooltipSuffix'); // Utiliser la traduction pour le suffixe
            }
            return label;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: '#f3f4f6',
          drawBorder: false,
        },
        ticks: {
          color: '#6b7280',
          font: {
            size: 14, // Taille de police plus grande pour les tablettes
            family: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
          },
          padding: 10,
          callback: function(value) {
            return value + t('actorHoursChart.yAxisSuffix'); // Utiliser la traduction pour le suffixe
          },
          maxTicksLimit: 6, // Limiter le nombre de graduations pour plus de clarté
        },
        border: {
          dash: [4, 4],
        },
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: '#4b5563',
          font: {
            size: 14, // Taille de police plus grande pour les tablettes
            family: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
          },
          padding: 10,
          maxRotation: 45, // Rotation des étiquettes pour éviter les chevauchements
          minRotation: 0,
        },
        border: {
          display: false,
        },
      }
    },
    animation: {
      duration: 800, // Animation plus rapide pour une meilleure réactivité
      easing: 'easeOutQuart',
    },
    layout: {
      padding: {
        left: 15,
        right: 15,
        top: 10,
        bottom: 15
      }
    },
    elements: {
      bar: {
        borderRadius: 8, // Coins plus arrondis pour un look moderne
        borderWidth: 1,
        borderSkipped: false, // Arrondir tous les coins
      }
    },
    interaction: {
      mode: 'index', // Interaction par index pour faciliter la sélection sur tablette
      intersect: false,
    },
    hover: {
      mode: 'nearest',
      intersect: true,
    },
  };

  return (
    <div className="chart-container h-full w-full flex items-center justify-center" style={{ touchAction: 'pan-y' }}>
      <Bar 
        options={options} 
        data={chartData}
        style={{ maxHeight: '100%', width: '100%' }}
      />
    </div>
  );
};

export default ActorHoursChart;

import React, { useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { selectVisibleEvents } from '../../redux/slices/eventsSlice';
import { selectActorsByIdMap } from '../../redux/slices/actorsSlice'; 
import { selectGroupsByIdMap } from '../../redux/slices/groupsSlice'; 
import { 
  getHumanActors, 
  calculateActorHours, 
  formatDuration 
} from '../../utils/timeUtils';
import ActorTimeList from '../time/ActorTimeList';
import ActorHoursChart from '../charts/ActorHoursChart';
import DatePicker from 'react-datepicker'; 
import 'react-datepicker/dist/react-datepicker.css'; 
// Import pour la traduction et les locales
import { useTranslation } from 'react-i18next';
import { fr, enUS } from 'date-fns/locale';

const TimeView = () => {
  const { t, i18n } = useTranslation(); // Hook de traduction
    const events = useSelector(selectVisibleEvents);
  const actorsById = useSelector(selectActorsByIdMap);
  const groupsById = useSelector(selectGroupsByIdMap);

  // État pour les IDs des acteurs sélectionnés pour le graphique
  const [selectedActorIdsForChart, setSelectedActorIdsForChart] = useState([]);
  // État pour le terme de recherche
  const [searchTerm, setSearchTerm] = useState('');
  // États pour les dates de début et de fin
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  // Déterminer la locale pour date-fns basé sur la langue i18n
  const datePickerLocale = i18n.language === 'fr' ? fr : enUS;

  const actorsState = useMemo(() => {
    const allIds = actorsById ? Object.keys(actorsById) : [];
    return { byId: actorsById || {}, allIds };
  }, [actorsById]);

  const humanActors = useMemo(() => getHumanActors(actorsState), [actorsState]);

  const actorsWithHours = useMemo(() => {
    if (!humanActors || !events || !groupsById) return [];

    return humanActors.map(actor => {
      if (!actor || !actor.id) return null; 
      
      // Passer startDate et endDate à calculateActorHours
      const totalMs = calculateActorHours(actor.id, events, groupsById, startDate, endDate);
      return {
        ...actor,
        totalHours: totalMs,
        totalHoursFormatted: formatDuration(totalMs)
      };
    }).filter(actor => actor !== null); 
  }, [humanActors, events, groupsById, startDate, endDate]); // Ajouter startDate et endDate aux dépendances

  // Filtrer les acteurs basés sur le terme de recherche
  const filteredActorsWithHours = useMemo(() => {
    if (!actorsWithHours) return [];
    const lowerCaseSearch = searchTerm.toLowerCase();
    return actorsWithHours.filter(actor => 
      (actor.firstName.toLowerCase().includes(lowerCaseSearch) ||
       actor.lastName.toLowerCase().includes(lowerCaseSearch))
      // On pourrait aussi filtrer sur le rôle si besoin:
      // || (actor.role && actor.role.toLowerCase().includes(lowerCaseSearch))
    );
  }, [actorsWithHours, searchTerm]);

  // Filtrer les acteurs à afficher dans le graphique basé sur la sélection
  const selectedActorsForChart = useMemo(() => {
    return actorsWithHours.filter(actor => selectedActorIdsForChart.includes(actor.id));
  }, [actorsWithHours, selectedActorIdsForChart]);

  console.log("Actors with calculated hours:", actorsWithHours);
  console.log("Selected Actor IDs for Chart:", selectedActorIdsForChart);
  console.log("Selected Actors for Chart:", selectedActorsForChart);

  // Gérer la sélection/désélection d'un acteur pour le graphique
  const handleActorSelect = (actorId) => {
    console.log("Selected Actor ID for interaction:", actorId);
    setSelectedActorIdsForChart(prevSelectedIds => {
      if (prevSelectedIds.includes(actorId)) {
        // Si déjà sélectionné, le retirer
        return prevSelectedIds.filter(id => id !== actorId);
      } else {
        // Sinon, l'ajouter
        return [...prevSelectedIds, actorId];
      }
    });
  };

  // Gérer le changement dans le champ de recherche
  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  // Gérer la sélection/désélection de tous les acteurs filtrés
  const handleSelectAll = (selectAll) => {
    const filteredIds = filteredActorsWithHours.map(actor => actor.id);
    setSelectedActorIdsForChart(prevSelectedIds => {
      const currentSelectedSet = new Set(prevSelectedIds);
      if (selectAll) {
        filteredIds.forEach(id => currentSelectedSet.add(id));
      } else {
        filteredIds.forEach(id => currentSelectedSet.delete(id));
      }
      return Array.from(currentSelectedSet);
    });
  };

  // Déterminer l'état de la checkbox "Tout sélectionner"
  const { isAllSelected, isIndeterminate } = useMemo(() => {
    const filteredIds = filteredActorsWithHours.map(actor => actor.id);
    const selectedFilteredCount = filteredIds.filter(id => selectedActorIdsForChart.includes(id)).length;

    if (filteredActorsWithHours.length === 0) {
      return { isAllSelected: false, isIndeterminate: false };
    }
    const allSelected = selectedFilteredCount === filteredActorsWithHours.length;
    const indeterminate = selectedFilteredCount > 0 && selectedFilteredCount < filteredActorsWithHours.length;

    return { isAllSelected: allSelected, isIndeterminate: indeterminate };
  }, [filteredActorsWithHours, selectedActorIdsForChart]);

  return (
    <div className="h-screen flex flex-col bg-gray-50 p-4 overflow-hidden">
      {/* En-tête de page avec style moderne */}
      <div className="mb-3 flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-800 flex items-center pl-10">
          <svg className="w-6 h-6 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {t('timeView.title')}
        </h2>
        <div className="text-xs text-gray-500 flex items-center">
          <svg className="w-4 h-4 mr-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {t('timeView.hoursCalculatedFromEvents')}
        </div>
      </div>
      
      {/* Conteneur principal avec ombre et coins arrondis */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex-grow flex flex-col">
        {/* Utilisation de Grid pour créer deux colonnes - Adapté pour tablette */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-0 h-full">
          {/* Colonne Gauche : Graphique des heures (2/3 de l'espace sur desktop, pleine largeur sur tablette) */}
          <div className="md:col-span-2 p-4 border-b md:border-b-0 md:border-r border-gray-100 flex flex-col h-full">
            <div className="flex-grow flex flex-col">
              {/* Titre de section */}
              <div className="mb-2 flex justify-between items-center">
                <h3 className="text-base font-semibold text-gray-800 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  {t('timeView.hoursChartTitle')}
                </h3>
                <div className="text-sm text-gray-500">
                  {selectedActorsForChart.length} {t('timeView.actor')} {selectedActorsForChart.length !== 1 ? t('timeView.actorsSelected') : t('timeView.actorSelected')}
                </div>
              </div>
              
              {/* Zone du graphique avec animation de transition - Optimisée pour tablette */}
              <div className="flex-grow flex items-center justify-center transition-all duration-300 ease-in-out overflow-hidden" style={{ minHeight: '350px' }}>
                {selectedActorsForChart.length > 0 ? (
                  <div className="w-full h-full" style={{ minHeight: '350px', touchAction: 'pan-y' }}>
                    <ActorHoursChart actorsData={selectedActorsForChart} />
                  </div>
                ) : (
                  <div className="text-center p-6 bg-gray-50 rounded-lg border border-dashed border-gray-200 w-full max-w-lg mx-auto">
                    <svg className="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    <p className="text-gray-500 mb-1">{t('timeView.noActorsSelectedTitle')}</p>
                    <p className="text-sm text-gray-400">{t('timeView.noActorsSelectedHint')}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Colonne Droite : Liste des acteurs (1/3 de l'espace sur desktop, pleine largeur sur mobile) */}
          <div className="md:col-span-1 p-4 flex flex-col h-full overflow-hidden">
            {actorsWithHours.length > 0 ? (
              <ActorTimeList 
                actors={filteredActorsWithHours} 
                selectedActorIds={selectedActorIdsForChart} 
                onSelectActor={handleActorSelect} 
                searchTerm={searchTerm}
                onSearchChange={handleSearchChange}
                onSelectAll={handleSelectAll}
                isAllSelected={isAllSelected}
                isIndeterminate={isIndeterminate}
              />
            ) : (
              <div className="p-3 text-center bg-gray-50 rounded-lg shadow-sm border border-gray-100">
                <svg className="w-10 h-10 text-gray-300 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-gray-500">{t('timeView.calculatingHours')}</p>
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Zone pour les filtres de date */}
      <div className="flex items-center space-x-2 p-4">
        <div className="flex items-center space-x-1">
          <label htmlFor="startDate" className="text-sm font-medium text-gray-600">{t('timeView.datePicker.startLabel')}</label>
          <DatePicker
            selected={startDate}
            onChange={(date) => setStartDate(date)}
            selectsStart
            startDate={startDate}
            endDate={endDate}
            dateFormat="P" // Utiliser le format localisé court
            placeholderText={t('timeView.datePicker.placeholder')}
            className="border border-gray-300 rounded-md shadow-sm px-2 py-1 text-sm focus:ring-indigo-500 focus:border-indigo-500"
            isClearable
            id="startDate"
            locale={datePickerLocale} // Passer la locale
          />
        </div>
        <div className="flex items-center space-x-1">
          <label htmlFor="endDate" className="text-sm font-medium text-gray-600">{t('timeView.datePicker.endLabel')}</label>
          <DatePicker
            selected={endDate}
            onChange={(date) => setEndDate(date)}
            selectsEnd
            startDate={startDate}
            endDate={endDate}
            minDate={startDate} // Empêche de sélectionner une date de fin avant la date de début
            dateFormat="P" // Utiliser le format localisé court
            placeholderText={t('timeView.datePicker.placeholder')}
            className="border border-gray-300 rounded-md shadow-sm px-2 py-1 text-sm focus:ring-indigo-500 focus:border-indigo-500"
            isClearable
            id="endDate"
            locale={datePickerLocale} // Passer la locale
          />
        </div>
      </div>
    </div>
  );
};

export default TimeView;

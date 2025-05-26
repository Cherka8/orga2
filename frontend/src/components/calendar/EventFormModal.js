import React, { useState, useEffect, useRef, useCallback, useMemo, useReducer } from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next'; // Import useTranslation
import { fr, enUS } from 'date-fns/locale'; // Import date-fns locales
import { selectAllActors, ACTOR_TYPES } from '../../redux/slices/actorsSlice';
import { selectAllGroups } from '../../redux/slices/groupsSlice';
import { formatTime, formatDate, TIME_OPTIONS } from '../../utils/timeUtils';
import { getColorName, getPaletteHexCodes } from '../../utils/colorUtils';
import '../../styles/event-modal.css';
import DatePicker from 'react-datepicker'; // Import DatePicker
import 'react-datepicker/dist/react-datepicker.css'; // Import default styles

// Fonction de debounce pour limiter les appels fréquents
const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * Component for draggable time/date control
 * @param {string} value - The displayed value
 * @param {function} onDrag - Function called when dragging with the delta value
 * @param {string} type - Type of control ('date', 'time')
 * @param {function} onClick - Function called when clicking on the value
 */
const DraggableTimeControl = ({ value, onDrag, type, onClick }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [dragStarted, setDragStarted] = useState(false);
  const controlRef = useRef(null);

  // Handle mouse down to start dragging
  const handleMouseDown = (e) => {
    setIsDragging(true);
    setStartX(e.clientX);
    setDragStarted(false);
    e.preventDefault();
    e.stopPropagation(); // Empêcher la propagation pour éviter de fermer la modal
  };

  // Handle click on the value (only if not dragging)
  const handleClick = (e) => {
    if (!dragStarted && onClick) {
      onClick(e);
    }
  };

  // Handle mouse move for dragging
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (isDragging) {
        const newDeltaX = e.clientX - startX;
        
        // Call the onDrag callback with the delta
        // For time, smaller movements change the time by 5 minutes
        const threshold = 15;
        
        if (Math.abs(newDeltaX) >= threshold) {
          // Mark that we've started dragging to prevent click
          setDragStarted(true);
          
          // Calculate the direction and magnitude
          const direction = newDeltaX > 0 ? 1 : -1;
          const magnitude = Math.floor(Math.abs(newDeltaX) / threshold);
          
          // Call the callback with the change
          onDrag(direction * magnitude);
          
          // Reset the start position
          setStartX(e.clientX);
        }
      }
    };

    const handleMouseUp = () => {
      if (isDragging) {
        setIsDragging(false);
        
        // Reset drag started after a short delay to allow click handler to check it
        setTimeout(() => {
          setDragStarted(false);
        }, 10);
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, startX, onDrag, type]);

  return (
    <div 
      className={`draggable-time-control ${isDragging ? 'dragging' : ''}`}
      ref={controlRef}
    >
      <div 
        className="draggable-time-value"
        onMouseDown={handleMouseDown}
        onClick={handleClick}
        style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
      >
        {value}
      </div>
    </div>
  );
};

/**
 * Component for the event creation popup
 * @param {boolean} isOpen - Whether the popup is open
 * @param {function} onClose - Function to call when the popup is closed
 * @param {object} position - Position {x, y} where the popup should be displayed
 * @param {Date} initialDate - Initial date for the event
 * @param {function} onSave - Function to call when the event is saved
 * @param {object} eventRect - Rectangle of the event (optional) to avoid overlap
 * @param {function} updateTempEvent - Function to update the temporary event
 * @param {object} eventToEdit - Event to edit (optional)
 */
const EventFormModal = ({ isOpen, onClose, position, initialDate, onSave, eventRect, updateTempEvent, eventToEdit }) => {
  const { t, i18n } = useTranslation(); // Get t function and i18n instance
  const currentLanguage = i18n.language;
  const dateFnsLocale = currentLanguage === 'fr' ? fr : enUS; // Determine date-fns locale

  const [title, setTitle] = useState(eventToEdit ? eventToEdit.title : '');
  const [selectedLocation, setSelectedLocation] = useState(eventToEdit ? eventToEdit.extendedProps.location : null);
  const [selectedParticipants, setSelectedParticipants] = useState(eventToEdit ? eventToEdit.extendedProps.participants : []);
  const [presenterId, setPresenterId] = useState(eventToEdit?.extendedProps?.presenterId || null);
  const [errorMessage, setErrorMessage] = useState('');
  const [timeValidationError, setTimeValidationError] = useState(''); // <-- Added state for time validation errors
  // State to hold the raw input value for end time while editing
  const [endTimeInputValue, setEndTimeInputValue] = useState(''); 
  const [description, setDescription] = useState(eventToEdit ? eventToEdit.extendedProps.description : '');
  const [eventColor, setEventColor] = useState(eventToEdit ? eventToEdit.backgroundColor : '#4f46e5'); // Couleur par défaut
  
  // Définition des reducers pour regrouper les états connexes
  const dateTimeReducer = (state, action) => {
    switch (action.type) {
      case 'SET_START_DATE':
        return { ...state, startDate: action.payload };
      case 'SET_END_DATE':
        return { ...state, endDate: action.payload };
      case 'SET_DATE_PICKER_OPEN':
        return { ...state, isDatePickerOpen: action.payload };
      case 'SET_START_TIME_PICKER_OPEN':
        return { ...state, isStartTimePickerOpen: action.payload };
      case 'SET_END_TIME_PICKER_OPEN':
        return { ...state, isEndTimePickerOpen: action.payload };
      case 'UPDATE_ALL':
        return { ...state, ...action.payload };
      default:
        return state;
    }
  };

  const pickerStateReducer = (state, action) => {
    switch (action.type) {
      case 'SET_SEARCH_TERM':
        return { ...state, searchTerm: action.payload };
      case 'SET_ACTIVE_FILTER':
        return { ...state, activeFilter: action.payload };
      case 'SET_SHOW_COLOR_PICKER':
        return { ...state, showColorPicker: action.payload };
      default:
        return state;
    }
  };

  // États regroupés pour les dates et heures
  const [dateTimeState, dateTimeDispatch] = useReducer(dateTimeReducer, {
    startDate: eventToEdit ? new Date(eventToEdit.start) : (initialDate || new Date()),
    endDate: eventToEdit ? new Date(eventToEdit.end) : (initialDate ? new Date(new Date(initialDate).setHours(initialDate.getHours() + 1)) : new Date(new Date().setHours(new Date().getHours() + 1))),
    isDatePickerOpen: false,
    isStartTimePickerOpen: false,
    isEndTimePickerOpen: false
  });
  
  // États regroupés pour les filtres et recherches
  const [pickerState, pickerDispatch] = useReducer(pickerStateReducer, {
    searchTerm: '',
    activeFilter: 'all',
    showColorPicker: false
  });
  
  // Get actors and groups from Redux store
  const allActors = useSelector(selectAllActors);
  const allGroups = useSelector(selectAllGroups);
  
  // Convert groups to actor-like format for display and combine with actors
  const allActorsAndGroups = useMemo(() => {
    const groupsAsActors = allGroups.map(group => ({
      id: group.id,
      type: ACTOR_TYPES.GROUP,
      name: group.name,
      avatar: group.avatar,
      members: group.members || []
    }));
    
    return [...allActors, ...groupsAsActors];
  }, [allActors, allGroups, ACTOR_TYPES.GROUP]);
  
  // Get all actors that are members of selected groups
  const selectedGroupMembers = useMemo(() => {
    const selectedGroups = selectedParticipants.filter(p => p.type === ACTOR_TYPES.GROUP);
    const memberIds = new Set();
    
    selectedGroups.forEach(group => {
      if (group.members && Array.isArray(group.members)) {
        group.members.forEach(memberId => memberIds.add(memberId));
      }
    });
    
    return Array.from(memberIds);
  }, [selectedParticipants, ACTOR_TYPES.GROUP]);
  
  // Check if an actor is a member of any selected group
  const isActorInSelectedGroups = useCallback((actorId) => {
    return selectedGroupMembers.includes(actorId);
  }, [selectedGroupMembers]);
  
  // Check if a group has common members with already selected groups
  const hasCommonMembersWithSelectedGroups = useCallback((group) => {
    const selectedGroups = selectedParticipants.filter(p => p.type === ACTOR_TYPES.GROUP);
    
    // If no groups are selected, there can't be common members
    if (selectedGroups.length === 0) return false;
    
    // Check if any member of the new group is also a member of any selected group
    return group.members.some(memberId => {
      return selectedGroups.some(selectedGroup => 
        selectedGroup.members && Array.isArray(selectedGroup.members) && 
        selectedGroup.members.includes(memberId)
      );
    });
  }, [selectedParticipants, ACTOR_TYPES.GROUP]);
  
  // Clear error message after 3 seconds
  useEffect(() => {
    if (errorMessage) {
      const timer = setTimeout(() => {
        setErrorMessage('');
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [errorMessage]);
  
  // Update fields when eventToEdit changes
  useEffect(() => {
    if (eventToEdit) {
      setTitle(eventToEdit.title || '');
      setSelectedLocation(eventToEdit.extendedProps?.location || null);
      setSelectedParticipants(eventToEdit.extendedProps?.participants || []);
      setPresenterId(eventToEdit.extendedProps?.presenterId || null);
      setDescription(eventToEdit.extendedProps?.description || '');
      setEventColor(eventToEdit.backgroundColor || '#4f46e5');
      
      dateTimeDispatch({
        type: 'UPDATE_ALL',
        payload: {
          startDate: new Date(eventToEdit.start),
          endDate: new Date(eventToEdit.end)
        }
      });
    }
  }, [eventToEdit]);

  // Update dates when initialDate changes
  useEffect(() => {
    if (initialDate && !eventToEdit) {
      dateTimeDispatch({
        type: 'UPDATE_ALL',
        payload: {
          startDate: new Date(initialDate),
          endDate: new Date(new Date(initialDate).setHours(initialDate.getHours() + 1))
        }
      });
    }
  }, [initialDate, eventToEdit]);
  
  // Définir la fonction debouncedUpdateTempEvent avant de l'utiliser dans les gestionnaires d'événements
  const debouncedUpdateTempEvent = useCallback(
    debounce((data) => {
      if (updateTempEvent) {
        console.log("Updating temp event (debounced):", data);
        updateTempEvent(data);
      }
    }, 150),
    [updateTempEvent]
  );

  // Handle title change
  const handleTitleChange = useCallback((e) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    
    // Update the temporary event with the new title using debounce
    if (updateTempEvent) {
      debouncedUpdateTempEvent({
        title: newTitle
      });
    }
  }, [debouncedUpdateTempEvent, updateTempEvent]);

  // Handle description change
  const handleDescriptionChange = useCallback((e) => {
    const newDescription = e.target.value;
    setDescription(newDescription);
    
    // Update the temporary event with the new description using debounce
    if (updateTempEvent) {
      debouncedUpdateTempEvent({
        extendedProps: {
          description: newDescription
        }
      });
    }
  }, [debouncedUpdateTempEvent, updateTempEvent]);

  // Handle date change
  const handleDateChange = useCallback((newDate) => { // Accept Date object directly
    const currentStartDate = new Date(dateTimeState.startDate);
    const currentEndDate = new Date(dateTimeState.endDate);
    
    // Set the date part of the start and end dates
    currentStartDate.setFullYear(newDate.getFullYear(), newDate.getMonth(), newDate.getDate());
    currentEndDate.setFullYear(newDate.getFullYear(), newDate.getMonth(), newDate.getDate());
    
    dateTimeDispatch({ 
      type: 'UPDATE_ALL', 
      payload: {
        startDate: currentStartDate,
        endDate: currentEndDate
        // isDatePickerOpen: false // Keep picker open after selection, handle close via outside click
      }
    });
    
    // Update the temporary event with the new dates
    if (updateTempEvent) {
      debouncedUpdateTempEvent({
        start: currentStartDate,
        end: currentEndDate
      });
    }
  }, [dateTimeState.startDate, dateTimeState.endDate, debouncedUpdateTempEvent, updateTempEvent]);

  // Handle start time change
  const handleStartTimeChange = useCallback((e) => {
    const newTime = e.target.value; // Get the 'HH:mm' string directly
    const currentStartDate = new Date(dateTimeState.startDate);
    let currentEndDate = new Date(dateTimeState.endDate); // Use let as it might be updated
    
    // Parse the HH:mm string and set the time
    const [hours, minutes] = newTime.split(':').map(Number);
    if (!isNaN(hours) && !isNaN(minutes)) { // Basic validation
      currentStartDate.setHours(hours, minutes, 0, 0);
    }

    // --- New Logic: Adjust End Time or Clear Error --- 
    if (currentEndDate < currentStartDate) {
      // Adjust end time to be 1 hour after the new start time
      const duration = 60 * 60 * 1000; // 1 hour in milliseconds
      currentEndDate.setTime(currentStartDate.getTime() + duration);
      setTimeValidationError(''); // Clear any previous error
      // Update both start and end dates in the state
      dateTimeDispatch({ 
        type: 'UPDATE_ALL', 
        payload: { startDate: currentStartDate, endDate: currentEndDate }
      });
    } else {
      // Times are valid or start time moved earlier, just clear error
      setTimeValidationError(''); // Clear validation error
      // Update only the start date in the state
      dateTimeDispatch({ 
        type: 'SET_START_DATE',
        payload: currentStartDate
      });
    }
    // --- End New Logic --- 
    
    // Update the temporary event with potentially updated start and end dates
    if (updateTempEvent) {
      debouncedUpdateTempEvent({
        start: currentStartDate,
        end: currentEndDate // Pass the potentially adjusted end time
      });
    }
  }, [dateTimeState.startDate, dateTimeState.endDate, debouncedUpdateTempEvent, updateTempEvent, setTimeValidationError, t]);

  // Handle end time change (only update temporary input state)
  const handleEndTimeChange = useCallback((e) => {
    setEndTimeInputValue(e.target.value);
    // Clear validation error immediately on change, it will be re-evaluated on blur
    if (timeValidationError) {
      setTimeValidationError('');
    }
  }, [timeValidationError, setTimeValidationError]); // Depend on timeValidationError to avoid unnecessary calls

  // Handle end time blur (validate and update main state)
  const handleEndTimeBlur = useCallback(() => {
    const newTime = endTimeInputValue; // Use the value from the temporary state
    const currentStartDate = new Date(dateTimeState.startDate); 
    const attemptedEndDate = new Date(dateTimeState.endDate); // Start with current valid date
    
    // Parse the HH:mm string and try to set the time
    const [hours, minutes] = newTime.split(':').map(Number);
    let isValidFormat = false;
    if (!isNaN(hours) && !isNaN(minutes) && hours >= 0 && hours < 24 && minutes >= 0 && minutes < 60) {
      attemptedEndDate.setHours(hours, minutes, 0, 0);
      isValidFormat = true;
    }
    
    if (!isValidFormat) {
        // If format is invalid, revert input to the last valid state and show error? Or just revert?
        setTimeValidationError(t('error.invalidTimeFormat') || 'Invalid time format'); // Add translation key if needed
        setEndTimeInputValue(formatTime(dateTimeState.endDate, dateFnsLocale)); // Revert input
        return; // Stop processing
    }

    // --- Validation Logic --- 
    if (attemptedEndDate < currentStartDate) {
      // Invalid: Show error and revert the input to the last valid state
      setTimeValidationError(t('error.endTimeBeforeStartTime')); 
      setEndTimeInputValue(formatTime(dateTimeState.endDate, dateFnsLocale)); // Revert input
      // No dispatch here - state remains unchanged
    } else {
      // Valid: Clear error and update the main state
      setTimeValidationError(''); 
      dateTimeDispatch({ 
        type: 'SET_END_DATE', 
        payload: attemptedEndDate // Update with the successfully validated date
      });
      // Update the temporary event as well
      if (updateTempEvent) {
          debouncedUpdateTempEvent({
            start: currentStartDate, 
            end: attemptedEndDate
          });
      }
    }
    // --- End Validation Logic --- 

  }, [dateTimeState.startDate, dateTimeState.endDate, endTimeInputValue, setTimeValidationError, dateTimeDispatch, updateTempEvent, t, dateFnsLocale, setEndTimeInputValue]);

  // Handle start time drag
  const handleStartTimeDrag = useCallback((delta) => {
    // Create a new date object to avoid mutating the original
    const newStartDate = new Date(dateTimeState.startDate);
    
    // Adjust by 5-minute increments
    newStartDate.setMinutes(newStartDate.getMinutes() + (delta * 5));
    
    // Calculate the duration between the original start and end times
    const duration = dateTimeState.endDate.getTime() - dateTimeState.startDate.getTime();
    
    // Create a new end date by adding the duration to the new start date
    const newEndDate = new Date(newStartDate.getTime() + duration);
    
    // Update state with the new dates
    dateTimeDispatch({
      type: 'UPDATE_ALL',
      payload: {
        startDate: newStartDate,
        endDate: newEndDate
      }
    });
    
    // Update the temporary event with the new dates using debounce
    debouncedUpdateTempEvent({
      start: newStartDate,
      end: newEndDate
    });
  }, [dateTimeState.startDate, dateTimeState.endDate, debouncedUpdateTempEvent]);

  // Handle end time drag
  const handleEndTimeDrag = useCallback((delta) => {
    // Create a new date object to avoid mutating the original
    const newEndDate = new Date(dateTimeState.endDate);
    
    // Adjust by 5-minute increments
    newEndDate.setMinutes(newEndDate.getMinutes() + (delta * 5));
    
    // Check that the end time is after the start time
    if (newEndDate <= dateTimeState.startDate) {
      // If the end time is before or equal to the start time, add 5 minutes to the start time
      newEndDate.setTime(dateTimeState.startDate.getTime() + 5 * 60 * 1000);
    }
    
    // Update state with the new end date
    dateTimeDispatch({ type: 'SET_END_DATE', payload: newEndDate });
    
    // Update the temporary event with the new end date using debounce
    debouncedUpdateTempEvent({
      end: newEndDate
    });
  }, [dateTimeState.startDate, dateTimeState.endDate, debouncedUpdateTempEvent]);

  // Scroll to current time in time picker
  const scrollToCurrentTime = (selectElement, currentTime) => {
    if (!selectElement) return;
    
    // Find the option that matches the current time
    const hours = currentTime.getHours();
    const minutes = currentTime.getMinutes();
    
    // Round to nearest 5 minutes for better matching
    const roundedMinutes = Math.round(minutes / 5) * 5;
    
    // Create a time string to match against option values
    const timeString = `${hours.toString().padStart(2, '0')}:${roundedMinutes.toString().padStart(2, '0')}`;
    
    // Find the matching option
    const options = selectElement.options;
    for (let i = 0; i < options.length; i++) {
      const optionTime = new Date(options[i].value);
      if (!isNaN(optionTime.getTime())) {
        const optionHours = optionTime.getHours();
        const optionMinutes = optionTime.getMinutes();
        const optionTimeString = `${optionHours.toString().padStart(2, '0')}:${optionMinutes.toString().padStart(2, '0')}`;
        
        if (optionTimeString === timeString || 
            (optionHours === hours && Math.abs(optionMinutes - minutes) < 15)) {
          // Set the scrollTop to position the option in view
          setTimeout(() => {
            selectElement.selectedIndex = i;
            const optionHeight = 35; // Approximate height of an option
            selectElement.scrollTop = (i * optionHeight) - (selectElement.clientHeight / 2) + (optionHeight / 2);
          }, 50);
          break;
        }
      }
    }
  };

  // Références
  const refs = useRef({
    popup: null,
    overlay: null,
    titleInput: null,
    datePicker: null,
    startTimePicker: null,
    endTimePicker: null,
    content: null,
    colorPicker: null,
    startTimeSelect: null,
    endTimeSelect: null,
  });

  // Effect to scroll to current time when time pickers open
  useEffect(() => {
    if (dateTimeState.isStartTimePickerOpen && refs.current.startTimeSelect) {
      scrollToCurrentTime(refs.current.startTimeSelect, dateTimeState.startDate);
    }
  }, [dateTimeState.isStartTimePickerOpen, dateTimeState.startDate]);

  useEffect(() => {
    if (dateTimeState.isEndTimePickerOpen && refs.current.endTimeSelect) {
      scrollToCurrentTime(refs.current.endTimeSelect, dateTimeState.endDate);
    }
  }, [dateTimeState.isEndTimePickerOpen, dateTimeState.endDate]);

  // Sync endTimeInputValue with the official endDate when it changes
  useEffect(() => {
    setEndTimeInputValue(formatTime(dateTimeState.endDate, dateFnsLocale));
  }, [dateTimeState.endDate, dateFnsLocale]);

  // Fonction de calcul de position optimisée avec useCallback
  const calculateModalPosition = useCallback(() => {
    if (!isOpen || !position || !refs.current.popup) return null;
    
    const popup = refs.current.popup;
    
    // Get dimensions after the popup is rendered
    const popupRect = popup.getBoundingClientRect();
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    
    // Popup dimensions
    const popupWidth = popupRect.width;
    const popupHeight = popupRect.height;
    
    let x, y;
    const margin = 15; // Safety margin
    
    // Intelligent positioning logic based on available space
    if (eventRect) {
      // Get event dimensions
      const eventLeft = eventRect.left;
      const eventRight = eventRect.right;
      const eventTop = eventRect.top;
      const eventBottom = eventRect.bottom;
      const eventHeight = eventRect.height;
      
      // Calculate available space in each direction
      const spaceRight = windowWidth - eventRight - margin;
      const spaceLeft = eventLeft - margin;
      const spaceAbove = eventTop - margin;
      const spaceBelow = windowHeight - eventBottom - margin;
      
      // Determine the best horizontal position (prioritize right, then left)
      let horizontalPosition = null;
      
      // Check if there's enough space to the right
      if (spaceRight >= popupWidth) {
        horizontalPosition = 'right';
        x = eventRight + margin;
      } 
      // If not enough space to the right, check if there's enough space to the left
      else if (spaceLeft >= popupWidth) {
        horizontalPosition = 'left';
        x = eventLeft - popupWidth - margin;
      }
      // If neither right nor left has enough space, use the side with more space
      else {
        if (spaceRight >= spaceLeft) {
          horizontalPosition = 'right-adjusted';
          x = Math.min(eventRight + margin, windowWidth - popupWidth - margin);
        } else {
          horizontalPosition = 'left-adjusted';
          x = Math.max(margin, eventLeft - popupWidth - margin);
        }
      }
      
      // Determine the best vertical position
      // Priority: 1. Center with event if fits, 2. Above if space, 3. Below if space, 4. Adjust to fit screen
      
      // First check if centering would cause the modal to go off-screen at the bottom
      const centeredY = eventTop + (eventHeight / 2) - (popupHeight / 2);
      const bottomOverflow = centeredY + popupHeight > windowHeight - margin;
      
      // If centering would cause overflow and there's enough space above, position above
      if (bottomOverflow && spaceAbove >= popupHeight) {
        y = eventTop - popupHeight - margin;
      } 
      // If centering would cause overflow and there's enough space below, position below
      else if (bottomOverflow && spaceBelow >= popupHeight) {
        y = eventBottom + margin;
      }
      // If centering would cause overflow but not enough space above or below, position at top with margin
      else if (bottomOverflow) {
        y = Math.max(margin, windowHeight - popupHeight - margin);
      }
      // If centering works fine, use centered position
      else {
        y = centeredY;
      }
      
      // Ensure the modal stays within the vertical bounds of the screen
      if (y < margin) {
        y = margin;
      } else if (y + popupHeight > windowHeight - margin) {
        y = windowHeight - popupHeight - margin;
      }
      
      // Special case: if there's really not enough horizontal space,
      // consider positioning above or below the event
      if (Math.max(spaceRight, spaceLeft) < popupWidth / 2 && 
          (spaceAbove >= popupHeight || spaceBelow >= popupHeight)) {
        
        if (spaceBelow >= popupHeight) {
          // Position below the event
          y = eventBottom + margin;
          // Center horizontally with the event
          x = eventLeft + (eventRect.width / 2) - (popupWidth / 2);
          horizontalPosition = 'below';
        } else if (spaceAbove >= popupHeight) {
          // Position above the event
          y = eventTop - popupHeight - margin;
          // Center horizontally with the event
          x = eventLeft + (eventRect.width / 2) - (popupWidth / 2);
          horizontalPosition = 'above';
        }
        
        // Ensure x stays within horizontal bounds
        x = Math.max(margin, Math.min(windowWidth - popupWidth - margin, x));
      }
    } else {
      // Fallback positioning for clicks without an event
      // Calculate available space in each direction
      const spaceRight = windowWidth - position.x - margin;
      const spaceLeft = position.x - margin;
      const spaceAbove = position.y - margin;
      const spaceBelow = windowHeight - position.y - margin;
      
      // Determine the best horizontal position
      if (spaceRight >= popupWidth) {
        // Enough space to the right
        x = position.x + margin;
      } else if (spaceLeft >= popupWidth) {
        // Enough space to the left
        x = position.x - popupWidth - margin;
      } else {
        // Not enough space on either side, use the side with more space
        if (spaceRight >= spaceLeft) {
          x = Math.min(position.x + margin, windowWidth - popupWidth - margin);
        } else {
          x = Math.max(margin, position.x - popupWidth - margin);
        }
      }
      
      // Determine the best vertical position based on available space
      // If click is in the bottom third of the screen, position the modal above
      if (position.y > (windowHeight * 2/3) && spaceAbove >= popupHeight) {
        y = position.y - popupHeight - margin;
      } 
      // If click is in the top third of the screen, position the modal below
      else if (position.y < (windowHeight * 1/3) && spaceBelow >= popupHeight) {
        y = position.y + margin;
      }
      // For middle third or if preferred position doesn't have enough space
      else {
        // Check which direction has more space
        if (spaceBelow >= spaceAbove && spaceBelow >= popupHeight) {
          y = position.y + margin;
        } else if (spaceAbove >= popupHeight) {
          y = position.y - popupHeight - margin;
        } else {
          // Not enough space in either direction, adjust to fit
          y = Math.max(margin, Math.min(windowHeight - popupHeight - margin, position.y - (popupHeight / 2)));
        }
      }
      
      // Final check to ensure the popup stays within the vertical bounds of the screen
      if (y < margin) {
        y = margin;
      } else if (y + popupHeight > windowHeight - margin) {
        y = windowHeight - popupHeight - margin;
      }
    }
    
    return { x, y };
  }, [isOpen, position, eventRect]);

  // Adjust the popup position to stay within the window and avoid overlapping the event
  useEffect(() => {
    if (isOpen && position && refs.current.popup) {
      const popup = refs.current.popup;
      
      // Calculer la position une seule fois
      const newPosition = calculateModalPosition();
      
      if (newPosition) {
        // Apply the position and make visible in a single operation to prevent flicker
        requestAnimationFrame(() => {
          popup.style.left = `${newPosition.x}px`;
          popup.style.top = `${newPosition.y}px`;
          popup.style.visibility = 'visible';
          popup.style.opacity = '1';
          popup.style.transform = 'scale(1)';
        });
      }
    }
  }, [isOpen, position, calculateModalPosition]);

  // Ensure the modal content is scrollable when needed
  useEffect(() => {
    if (isOpen && refs.current.content) {
      // Réinitialiser la position de défilement au début
      refs.current.content.scrollTop = 0;
    }
  }, [isOpen]);

  // Focus on the title field when the popup opens
  useEffect(() => {
    if (isOpen) {
      // Small delay to ensure the modal is rendered
      setTimeout(() => {
        if (refs.current.titleInput) {
          refs.current.titleInput.focus();
        }
      }, 50);
    }
  }, [isOpen]);

  // Gestionnaires d'événements pour les clics en dehors des sélecteurs
  const handleClickOutside = useCallback((e) => {
    if (refs.current.datePicker && !refs.current.datePicker.contains(e.target)) {
      dateTimeDispatch({ type: 'SET_DATE_PICKER_OPEN', payload: false });
    }
    if (refs.current.startTimePicker && !refs.current.startTimePicker.contains(e.target)) {
      dateTimeDispatch({ type: 'SET_START_TIME_PICKER_OPEN', payload: false });
    }
    if (refs.current.endTimePicker && !refs.current.endTimePicker.contains(e.target)) {
      dateTimeDispatch({ type: 'SET_END_TIME_PICKER_OPEN', payload: false });
    }
    if (refs.current.colorPicker && !refs.current.colorPicker.contains(e.target)) {
      pickerDispatch({ type: 'SET_SHOW_COLOR_PICKER', payload: false });
    }
  }, [dateTimeDispatch, pickerDispatch]);

  // Close the selectors when clicking outside
  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [handleClickOutside]);

  const [isDraggingGlobally, setIsDraggingGlobally] = useState(false);

  // Gestionnaires d'événements globaux pour le drag
  const handleGlobalMouseDown = useCallback(() => {
    setIsDraggingGlobally(false);
  }, []);
  
  const handleGlobalMouseMove = useCallback((e) => {
    // Si la souris se déplace avec un bouton enfoncé, c'est un drag
    if (e.buttons > 0) {
      setIsDraggingGlobally(true);
    }
  }, []);
  
  const handleGlobalMouseUp = useCallback(() => {
    // Réinitialiser après un court délai pour permettre à onClick de vérifier l'état
    setTimeout(() => {
      setIsDraggingGlobally(false);
    }, 10);
  }, []);

  // Ajouter les écouteurs d'événements globaux
  useEffect(() => {
    document.addEventListener('mousedown', handleGlobalMouseDown);
    document.addEventListener('mousemove', handleGlobalMouseMove);
    document.addEventListener('mouseup', handleGlobalMouseUp);
    
    return () => {
      document.removeEventListener('mousedown', handleGlobalMouseDown);
      document.removeEventListener('mousemove', handleGlobalMouseMove);
      document.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [handleGlobalMouseDown, handleGlobalMouseMove, handleGlobalMouseUp]);

  // Close the popup when clicking outside
  const handleOverlayClick = (e) => {
    // Ne fermer que si c'est un clic simple et non la fin d'un drag
    if (e.target === refs.current.overlay && !isDraggingGlobally) {
      onClose();
    }
  };

  // Handle the Escape key to close the popup
  useEffect(() => {
    const handleEscapeKey = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscapeKey);
    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isOpen, onClose]);

  // Handle the animation of opening/closing
  useEffect(() => {
    if (isOpen && refs.current.popup) {
      // Small delay to allow the DOM to update
      setTimeout(() => {
        if (refs.current.popup) {
          refs.current.popup.classList.add('open');
        }
      }, 10);
    }
  }, [isOpen]);

  // Filtrer les acteurs avec useMemo pour éviter des recalculs inutiles
  const filteredActors = useMemo(() => {
    return allActorsAndGroups.filter(actor => {
      // Handle search term
      let matchesSearch = false;
      
      if (actor.type === ACTOR_TYPES.HUMAN) {
        // Pour humans, search in first name and last name
        const fullName = `${actor.firstName || ''} ${actor.lastName || ''}`.toLowerCase();
        matchesSearch = fullName.includes(pickerState.searchTerm.toLowerCase()) ||
                       (actor.firstName || '').toLowerCase().includes(pickerState.searchTerm.toLowerCase()) ||
                       (actor.lastName || '').toLowerCase().includes(pickerState.searchTerm.toLowerCase());
      } else {
        // Pour locations, objects, and groups, search in name
        matchesSearch = (actor.name || '').toLowerCase().includes(pickerState.searchTerm.toLowerCase());
      }
      
      // Handle filter
      const matchesFilter = pickerState.activeFilter === 'all' || actor.type === pickerState.activeFilter;
      
      return matchesSearch && matchesFilter;
    });
  }, [allActorsAndGroups, pickerState.searchTerm, pickerState.activeFilter, ACTOR_TYPES.HUMAN]);

  // Helper function to get actor name based on type - Optimisé avec useCallback
  const getActorName = useCallback((actor) => {
    if (!actor) return '';
    
    if (actor.type === ACTOR_TYPES.HUMAN) {
      return `${actor.firstName || ''} ${actor.lastName || ''}`.trim();
    } else {
      return actor.name || '';
    }
  }, [ACTOR_TYPES.HUMAN]);

  // Helper function to get actor avatar
  const getActorAvatar = useCallback((actor) => {
    if (!actor) return null;
    
    // Si l'acteur a une photo, l'utiliser
    if (actor.photo) {
      return actor.photo;
    }
    
    // Si l'acteur a une image, l'utiliser
    if (actor.image) {
      return actor.image;
    }
    
    // Sinon, retourner null pour utiliser l'initiale
    return null;
  }, []);

  // Helper function to get actor initial for avatar
  const getActorInitial = useCallback((actor) => {
    if (!actor) return '';
    
    if (actor.type === ACTOR_TYPES.HUMAN) {
      if (actor.firstName) return actor.firstName.charAt(0).toUpperCase();
      if (actor.lastName) return actor.lastName.charAt(0).toUpperCase();
      return '';
    } else {
      return actor.name ? actor.name.charAt(0).toUpperCase() : '';
    }
  }, [ACTOR_TYPES.HUMAN]);

  // Fonction pour basculer le statut d'intervenant
  const togglePresenterStatus = (participant) => {
    // Vérifier si le participant est de type humain
    if (participant.type !== ACTOR_TYPES.HUMAN) {
      return;
    }
    
    // Si ce participant est déjà l'intervenant, le désélectionner
    if (presenterId === participant.id) {
      setPresenterId(null);
      
      // Mettre à jour l'événement temporaire
      if (updateTempEvent) {
        debouncedUpdateTempEvent({
          extendedProps: {
            presenterId: null
          }
        });
      }
    } else {
      // Sinon, le définir comme intervenant
      setPresenterId(participant.id);
      
      // Mettre à jour l'événement temporaire
      if (updateTempEvent) {
        debouncedUpdateTempEvent({
          extendedProps: {
            presenterId: participant.id
          }
        });
      }
    }
  };

  // Handle actor selection
  const handleActorSelect = (actor) => {
    if (actor.type === ACTOR_TYPES.LOCATION) {
      setSelectedLocation(actor);
      
      // Mettre à jour l'événement temporaire avec le nouveau lieu
      if (updateTempEvent) {
        debouncedUpdateTempEvent({
          extendedProps: {
            location: actor
          }
        });
      }
    } else {
      // Check if the actor is already selected
      const isAlreadySelected = selectedParticipants.some(p => p.id === actor.id);
      
      if (isAlreadySelected) {
        // Remove the actor from selection
        const updatedParticipants = selectedParticipants.filter(p => p.id !== actor.id);
        setSelectedParticipants(updatedParticipants);
        
        // Mettre à jour l'événement temporaire avec les participants mis à jour
        if (updateTempEvent) {
          debouncedUpdateTempEvent({
            extendedProps: {
              participants: updatedParticipants
            }
          });
        }
      } else {
        if (actor.type === ACTOR_TYPES.GROUP) {
          // Check if this group has common members with already selected groups
          if (hasCommonMembersWithSelectedGroups(actor)) {
            setErrorMessage(t('eventForm.error.groupConflictMembers')); // Use translation key
            return;
          }
          
          // If selecting a group, remove any individual actors that are members of this group
          const newSelectedParticipants = selectedParticipants.filter(p => {
            // Keep if it's a group or if it's not a member of the selected group
            return p.type === ACTOR_TYPES.GROUP || !actor.members.includes(p.id);
          });
          
          // Add the group to selection
          const updatedParticipants = [...newSelectedParticipants, {
            ...actor,
            // S'assurer que toutes les propriétés importantes sont copiées
            id: actor.id,
            type: actor.type,
            name: actor.name,
            firstName: actor.firstName,
            lastName: actor.lastName,
            photo: actor.photo,
            image: actor.image,
            profilePicture: actor.profilePicture
          }];
          setSelectedParticipants(updatedParticipants);
          
          // Mettre à jour l'événement temporaire avec les participants mis à jour
          if (updateTempEvent) {
            debouncedUpdateTempEvent({
              extendedProps: {
                participants: updatedParticipants
              }
            });
          }
          
          // If we removed any individual actors, show a message
          if (selectedParticipants.length !== newSelectedParticipants.length) {
            setErrorMessage(t('eventForm.info.participantsRemovedFromGroup')); // Use translation key
          }
        } else {
          // If actor is already in a selected group, don't add it
          if (isActorInSelectedGroups(actor.id)) {
            setErrorMessage(t('eventForm.error.participantInGroup')); // Use translation key
            return;
          }
          
          // Add the actor to selection
          const updatedParticipants = [...selectedParticipants, {
            ...actor,
            // S'assurer que toutes les propriétés importantes sont copiées
            id: actor.id,
            type: actor.type,
            name: actor.name,
            firstName: actor.firstName,
            lastName: actor.lastName,
            photo: actor.photo,
            image: actor.image,
            profilePicture: actor.profilePicture
          }];
          setSelectedParticipants(updatedParticipants);
          
          // Mettre à jour l'événement temporaire avec les participants mis à jour
          if (updateTempEvent) {
            debouncedUpdateTempEvent({
              extendedProps: {
                participants: updatedParticipants
              }
            });
          }
        }
      }
    }
  };

  // Handle removal of a selected actor
  const handleRemoveLocation = () => {
    setSelectedLocation(null);
    
    // Mettre à jour l'événement temporaire avec le lieu supprimé
    if (updateTempEvent) {
      debouncedUpdateTempEvent({
        extendedProps: {
          location: null
        }
      });
    }
  };

  const handleRemoveParticipant = (participantId) => {
    const updatedParticipants = selectedParticipants.filter(p => p.id !== participantId);
    setSelectedParticipants(updatedParticipants);
    
    // Mettre à jour l'événement temporaire avec les participants mis à jour
    if (updateTempEvent) {
      debouncedUpdateTempEvent({
        extendedProps: {
          participants: updatedParticipants
        }
      });
    }
  };

  // Handle saving the event
  const handleSave = () => {
    const eventTitle = title.trim() || t('eventForm.untitledEvent'); // Use translation key
    
    // Ensure dates are properly cloned to avoid reference issues
    const eventStart = new Date(dateTimeState.startDate.getTime());
    const eventEnd = new Date(dateTimeState.endDate.getTime());
    
    const newEvent = {
      id: eventToEdit ? eventToEdit.id : String(Date.now()) + '-' + Math.floor(Math.random() * 1000),
      title: eventTitle,
      start: eventStart,
      end: eventEnd,
      backgroundColor: eventColor,
      borderColor: eventColor,
      extendedProps: {
        location: selectedLocation ? { ...selectedLocation } : null,
        participants: selectedParticipants.map(p => ({ ...p })),
        presenterId: presenterId,
        description: description
      }
    };
    
    onSave(newEvent);
    
    // Reset the form
    setTitle('');
    pickerDispatch({ type: 'SET_SEARCH_TERM', payload: '' });
    pickerDispatch({ type: 'SET_ACTIVE_FILTER', payload: 'all' });
    setSelectedLocation(null);
    setSelectedParticipants([]);
    setPresenterId(null);
    setDescription('');
    setEventColor('#4f46e5'); // Réinitialiser la couleur
  };

  // Palette de couleurs variées
  const colorPalette = getPaletteHexCodes();

  // Sélectionner une couleur
  const handleColorSelect = (color) => {
    setEventColor(color);
    pickerDispatch({ type: 'SET_SHOW_COLOR_PICKER', payload: false });
    
    // Mettre à jour la couleur de l'événement temporaire
    if (updateTempEvent) {
      debouncedUpdateTempEvent({
        backgroundColor: color,
        borderColor: color
      });
    }
  };

  // Don't render anything if the popup is closed
  if (!isOpen) return null;

  return (
    <div 
      ref={(ref) => refs.current.overlay = ref}
      className={`event-popup-overlay ${isOpen ? 'open' : ''}`}
      onMouseDown={handleOverlayClick}
    >
      <div 
        ref={(ref) => refs.current.popup = ref}
        className={`event-popup ${isOpen ? 'open' : ''}`}
        onClick={(e) => e.stopPropagation()}
        style={{ 
          visibility: 'hidden',
          position: 'absolute',
          left: position ? position.x : 0,
          top: position ? position.y : 0
        }}
      >
        {/* En-tête de la modal - fixe */}
        <div className="event-popup-header">
          <input
            ref={(ref) => refs.current.titleInput = ref}
            type="text"
            className="event-popup-title-input"
            placeholder={t('eventForm.addTitlePlaceholder')} // Translate placeholder
            value={title}
            onChange={handleTitleChange}
            style={{ 
              '--event-color': eventColor,
            }}
          />
          <button className="event-popup-close-btn" onClick={onClose}>
            <span>×</span>
          </button>
        </div>
        
        {/* Corps de la modal - défilant */}
        <div 
          ref={(ref) => refs.current.content = ref}
          className="event-popup-body"
        >
          {/* Date et heure */}
          <div className="event-popup-datetime">
            <div 
              ref={(ref) => refs.current.colorPicker = ref}
              className="event-popup-color-preview-container"
            >
              <div 
                className="event-popup-color-preview" 
                style={{ backgroundColor: eventColor }}
                onClick={() => pickerDispatch({ type: 'SET_SHOW_COLOR_PICKER', payload: !pickerState.showColorPicker })}
                title={t('eventForm.eventColorTooltip')} // Translate tooltip
              ></div>
              {pickerState.showColorPicker && (
                <div className="event-popup-color-palette">
                  {colorPalette.map((color) => (
                    <div
                      key={color}
                      className={`event-popup-color-option tooltip-host ${eventColor === color ? 'selected' : ''}`}
                      style={{ backgroundColor: color }}
                      onClick={() => handleColorSelect(color)}
                      data-tooltip={getColorName(color, t)} // Pass t function here
                    />
                  ))}
                </div>
              )}
            </div>
            <div className="event-popup-datetime-controls">
              {/* Date control */}
              <div 
                ref={(ref) => refs.current.datePicker = ref}
                className="event-popup-date-control"
              >
                <div 
                  className="event-popup-date-display"
                  onClick={() => dateTimeDispatch({ type: 'SET_DATE_PICKER_OPEN', payload: !dateTimeState.isDatePickerOpen })}
                >
                  {formatDate(dateTimeState.startDate, dateFnsLocale)}
                </div>
                {dateTimeState.isDatePickerOpen && (
                  <div className="event-popup-date-picker"> {/* Consider removing this wrapper if DatePicker handles positioning */}
                    <DatePicker
                      selected={dateTimeState.startDate}
                      onChange={handleDateChange} 
                      inline // Display the calendar directly, not in a dropdown
                      // onClickOutside={() => dateTimeDispatch({ type: 'SET_DATE_PICKER_OPEN', payload: false })} // Let the main handleClickOutside handle this
                    />
                  </div>
                )}
              </div>
              
              <span className="event-popup-time-separator">·</span>
              
              {/* Start time input - Always visible */}
              <div className="event-popup-time-control"> 
                <input
                  type="time"
                  id="startTime"
                  value={formatTime(dateTimeState.startDate, dateFnsLocale)} 
                  onChange={handleStartTimeChange} 
                  className="time-input form-input block w-full sm:text-sm border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                  disabled={false}
                  step="900" // Optional: suggests 15-min intervals, browser-dependent
                />
              </div>
              
              <span className="event-popup-time-separator">–</span>
              
              {/* End time input - Always visible */}
              <div className="event-popup-time-control">
                <input
                  type="time"
                  id="endTime"
                  value={endTimeInputValue} 
                  onChange={handleEndTimeChange} 
                  onBlur={handleEndTimeBlur} // <-- Added onBlur handler
                  className="time-input form-input block w-full sm:text-sm border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                  disabled={false}
                  step="900" // Optional: suggests 15-min intervals, browser-dependent
                />
              </div>
            </div>
          </div>

          {/* Display Time Validation Error Here */}
          {timeValidationError && (
            <div className="event-popup-error text-red-600 text-xs mt-1 px-4">
              {timeValidationError}
            </div>
          )}

          {/* Actor search section */}
          <div className="event-popup-search">
            <input 
              type="text"
              className="event-popup-search-input"
              placeholder={t('eventForm.searchActorsPlaceholder')} // <-- Use translation key
              value={pickerState.searchTerm}
              onChange={(e) => pickerDispatch({ type: 'SET_SEARCH_TERM', payload: e.target.value })}
            />
          </div>

          {/* Actor filters */}
          <div className="event-popup-filters">
            <div 
              className={`event-popup-filter ${pickerState.activeFilter === 'all' ? 'active' : ''}`}
              onClick={() => pickerDispatch({ type: 'SET_ACTIVE_FILTER', payload: 'all' })}
            >
              {t('eventForm.filters.all')}
            </div>
            <div 
              className={`event-popup-filter ${pickerState.activeFilter === ACTOR_TYPES.HUMAN ? 'active' : ''}`}
              onClick={() => pickerDispatch({ type: 'SET_ACTIVE_FILTER', payload: ACTOR_TYPES.HUMAN })}
            >
              {t('eventForm.filters.humans')}
            </div>
            <div 
              className={`event-popup-filter ${pickerState.activeFilter === ACTOR_TYPES.LOCATION ? 'active' : ''}`}
              onClick={() => pickerDispatch({ type: 'SET_ACTIVE_FILTER', payload: ACTOR_TYPES.LOCATION })}
            >
              {t('eventForm.filters.locations')}
            </div>
            <div 
              className={`event-popup-filter ${pickerState.activeFilter === ACTOR_TYPES.GROUP ? 'active' : ''}`}
              onClick={() => pickerDispatch({ type: 'SET_ACTIVE_FILTER', payload: ACTOR_TYPES.GROUP })}
            >
              {t('eventForm.filters.groups')}
            </div>
          </div>

          {/* Actor list */}
          <div className="event-popup-actors-list">
            {filteredActors.map(actor => (
              <div 
                key={actor.id} 
                className={`event-popup-actor ${
                  (actor.type === ACTOR_TYPES.LOCATION && selectedLocation?.id === actor.id) ||
                  (actor.type !== ACTOR_TYPES.LOCATION && selectedParticipants.some(p => p.id === actor.id))
                    ? 'selected' : ''
                }`}
                onClick={() => handleActorSelect(actor)}
              >
                <div className={`event-popup-actor-avatar ${actor.type}`}>
                  {getActorAvatar(actor) ? (
                    <img src={getActorAvatar(actor)} alt={getActorName(actor)} />
                  ) : (
                    getActorInitial(actor)
                  )}
                </div>
                <div className="event-popup-actor-name">{getActorName(actor)}</div>
              </div>
            ))}
          </div>

          {/* Selection columns */}
          <div className="event-popup-columns">
            {/* Location column */}
            <div className="event-popup-column">
              <div className="event-popup-column-header">
                <div className="event-popup-column-title">{t('eventForm.locationColumnHeader')}</div>
              </div>
              <div className="event-popup-column-content">
                {selectedLocation ? (
                  <div className="event-popup-selected-location">
                    <div className="event-popup-location-background">
                      {(selectedLocation.avatar || selectedLocation.photo) ? (
                        <img src={selectedLocation.avatar || selectedLocation.photo} alt={getActorName(selectedLocation)} />
                      ) : (
                        <div className="event-popup-location-placeholder">
                          {getActorInitial(selectedLocation)}
                        </div>
                      )}
                    </div>
                    <div className="event-popup-location-name">{getActorName(selectedLocation)}</div>
                    <div 
                      className="event-popup-location-remove"
                      onClick={handleRemoveLocation}
                    >
                      ×
                    </div>
                  </div>
                ) : (
                  <div className="event-popup-empty-selection">{t('eventForm.noLocationSelected')}</div>
                )}
              </div>
            </div>

            {/* Participants column */}
            <div className="event-popup-column">
              <div className="event-popup-column-header">
                <div className="event-popup-column-title">{t('eventForm.participantsColumnHeader')}</div>
                {selectedParticipants.length > 0 && (
                  <button 
                    className="event-popup-clear-btn"
                    onClick={() => setSelectedParticipants([])}
                  >
                    Clear
                  </button>
                )}
              </div>
              <div className="event-popup-column-content">
                {selectedParticipants.length > 0 ? (
                  // Trier les participants pour mettre l'intervenant en haut
                  [...selectedParticipants].sort((a, b) => {
                    if (a.id === presenterId) return -1;
                    if (b.id === presenterId) return 1;
                    return 0;
                  }).map(participant => (
                    <div 
                      key={participant.id} 
                      className={`event-popup-selected-item ${participant.id === presenterId ? 'presenter' : ''}`}
                    >
                      <div className={`event-popup-selected-item-avatar ${participant.type}`}>
                        {getActorAvatar(participant) ? (
                          <img src={getActorAvatar(participant)} alt={getActorName(participant)} />
                        ) : (
                          getActorInitial(participant)
                        )}
                        {participant.type === ACTOR_TYPES.HUMAN && (
                          <div 
                            className={`event-popup-presenter-star-container ${participant.id === presenterId ? 'active' : ''}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              togglePresenterStatus(participant);
                            }}
                            title={participant.id === presenterId ? t('eventForm.removePresenter') : t('eventForm.addPresenter')} // <-- Use translation keys
                          >
                            <div className={`event-popup-presenter-star ${participant.id === presenterId ? 'active' : ''}`}>
                              ★
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="event-popup-selected-item-name">{getActorName(participant)}</div>
                      <div 
                        className="event-popup-selected-item-remove"
                        onClick={() => handleRemoveParticipant(participant.id)}
                      >
                        ×
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="event-popup-empty-selection">{t('eventForm.noParticipantsSelected')}</div>
                )}
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="event-popup-description">
            <div className="event-popup-description-header">
              <label className="event-popup-label">{t('eventForm.descriptionTitle')}</label>
            </div>
            <div className="event-popup-description-container">
              <textarea
                className="event-popup-description-input"
                placeholder={t('eventForm.addDescriptionPlaceholder')}
                value={description}
                onChange={handleDescriptionChange}
              />
              {description && (
                <div className="event-popup-description-character-count">
                  {description.length} characters
                </div>
              )}
            </div>
          </div>
          
          {/* Error message */}
          {errorMessage && (
            <div className="event-popup-error">
              {errorMessage}
            </div>
          )}
        </div>
        
        {/* Pied de page avec boutons - fixe */}
        <div className="event-popup-footer">
          <button 
            className="event-popup-btn event-popup-btn-secondary"
            onClick={onClose}
          >
            {t('eventForm.cancelButton')}
          </button>
          <button 
            className="event-popup-btn event-popup-btn-primary"
            onClick={handleSave}
          >
            {eventToEdit ? t('eventForm.updateButton') : t('eventForm.saveButton')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default React.memo(EventFormModal);

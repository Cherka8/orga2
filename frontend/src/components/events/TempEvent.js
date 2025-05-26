import React from 'react';
import { useSelector } from 'react-redux';
import { ACTOR_TYPES } from '../../redux/slices/actorsSlice';

/**
 * Component to display an event in the calendar
 * @param {Object} eventInfo - Event information provided by FullCalendar
 */
const TempEvent = ({ eventInfo }) => {
  const { event } = eventInfo;
  const isTemp = event.classNames.includes('temp-event');
  
  // Récupérer les données des groupes depuis le store Redux
  const groupsById = useSelector(state => state.groups.byId || {});
  
  // Get the event colors
  const borderColor = event.borderColor || '#4f46e5';
  
  // Fonction pour assombrir une couleur
  const darkenColor = (color, percent = 30) => {
    try {
      // S'assurer que la couleur est au format hexadécimal
      if (!color || !color.startsWith('#') || color.length !== 7) {
        return '#555555'; // Couleur par défaut si le format est incorrect
      }
      
      // Convertir la couleur hex en RGB
      let r = parseInt(color.substring(1, 3), 16);
      let g = parseInt(color.substring(3, 5), 16);
      let b = parseInt(color.substring(5, 7), 16);
      
      // Assombrir chaque composante
      r = Math.max(0, Math.floor(r * (100 - percent) / 100));
      g = Math.max(0, Math.floor(g * (100 - percent) / 100));
      b = Math.max(0, Math.floor(b * (100 - percent) / 100));
      
      // Reconvertir en hex
      return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    } catch (error) {
      return '#555555'; // Couleur par défaut en cas d'erreur
    }
  };
  
  // Calculer la couleur assombrie pour l'heure
  const timeColor = darkenColor(borderColor);
  
  // Format time function
  const formatTime = (date) => {
    if (!date) return '';
    return date.toLocaleTimeString('fr-FR', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  };

  // Function to get initials from participant
  const getInitials = (participant) => {
    if (participant.type === ACTOR_TYPES.HUMAN) {
      return `${participant.firstName?.[0] || ''}${participant.lastName?.[0] || ''}`;
    } else if (participant.type === ACTOR_TYPES.GROUP) {
      return participant.name?.[0] || '';
    }
    return '';
  };

  // Function to get avatar color from participant type
  const getAvatarColor = (type) => {
    switch (type) {
      case ACTOR_TYPES.HUMAN:
        return '#8B9467';
      case ACTOR_TYPES.GROUP:
        return '#6B7280';
      default:
        return '#6B7280';
    }
  };

  // Function to render participants
  const renderParticipants = (participants = []) => {
    // Enrichir les participants de type GROUP avec les données complètes du groupe
    const enrichedParticipants = participants.map(participant => {
      if (participant.type === ACTOR_TYPES.GROUP && participant.id) {
        // Récupérer les données complètes du groupe depuis le store Redux
        const fullGroupData = groupsById[participant.id];
        if (fullGroupData) {
          return { ...participant, ...fullGroupData };
        }
      }
      return participant;
    });
    
    const filteredParticipants = enrichedParticipants.filter(
      p => p.type === ACTOR_TYPES.HUMAN || 
           p.type === ACTOR_TYPES.GROUP
    );
    
    if (filteredParticipants.length === 0) return null;
    
    // Limiter à 2 avatars maximum pour économiser de l'espace
    const visibleParticipants = filteredParticipants.slice(0, 2);
    const remainingCount = filteredParticipants.length - visibleParticipants.length;
    
    return (
      <div className="event-participants">
        {visibleParticipants.map((participant, index) => {
          // Déterminer la source de l'image (photo, avatar ou image)
          const imageSource = participant.photo || participant.avatar || participant.image || null;
          
          return (
            <div 
              key={participant.id} 
              className="event-avatar"
              style={{
                backgroundColor: getAvatarColor(participant.type),
                zIndex: visibleParticipants.length - index,
                backgroundImage: imageSource ? `url(${imageSource})` : 'none',
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}
            >
              {!imageSource && (getInitials(participant) || '?')}
            </div>
          );
        })}
        {remainingCount > 0 && (
          <div 
            className="event-avatar"
            style={{
              backgroundColor: '#6B7280',
              zIndex: 0
            }}
          >
            +{remainingCount}
          </div>
        )}
      </div>
    );
  };
  
  if (isTemp) {
    // For temporary events, use our custom rendering
    return (
      <div 
        className="event-card temp-event-card"
        style={{ 
          borderColor: borderColor,
          borderStyle: 'dashed',
          backgroundColor: `${borderColor}05`, // Couleur de l'événement avec 5% d'opacité
        }}
      >
        <div className="event-content">
          <div 
            className="event-title"
            style={{ color: borderColor }}
          >
            {event.title || 'New event'}
          </div>
          <div className="event-time" style={{ color: timeColor }}>
            {formatTime(event.start)} - {formatTime(event.end)}
          </div>
        </div>
        <div className="event-footer">
          {/* No participants for temporary events */}
        </div>
      </div>
    );
  }
  
  // For regular events
  return (
    <div 
      className="event-card"
      style={{ 
        borderColor: borderColor,
        backgroundColor: `${borderColor}05`, // Couleur de l'événement avec 5% d'opacité
      }}
    >
      <div className="event-content">
        <div 
          className="event-title"
          style={{ color: borderColor }}
        >
          {event.title}
        </div>
        <div className="event-time" style={{ color: timeColor }}>
          {formatTime(event.start)} - {formatTime(event.end)}
        </div>
      </div>
      <div className="event-footer">
        {renderParticipants(event.extendedProps?.participants || [])}
      </div>
    </div>
  );
};

export default TempEvent;

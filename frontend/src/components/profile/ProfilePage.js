import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  ArrowLeftIcon, 
  UserIcon, 
  EnvelopeIcon, 
  PhoneIcon, 
  LockClosedIcon, 
  LanguageIcon,
  BellIcon,
  ArrowRightOnRectangleIcon,
  CameraIcon,
  PencilIcon
} from '@heroicons/react/24/outline';
import '../../styles/profile.css';

const ProfilePage = () => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  
  // Données utilisateur fictives (à remplacer par des données réelles plus tard)
  const [user, setUser] = useState({
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    phone: '+33 6 12 34 56 78',
    profilePicture: null,
    language: i18n.language.split('-')[0], // 'fr' ou 'en'
    notifications: {
      email: true,
      browser: false
    }
  });

  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({...user});
  const [activeTab, setActiveTab] = useState('personal');
  const [showConfirmLogout, setShowConfirmLogout] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.startsWith('notifications.')) {
      const notifType = name.split('.')[1];
      setFormData({
        ...formData,
        notifications: {
          ...formData.notifications,
          [notifType]: checked
        }
      });
    } else {
      setFormData({
        ...formData,
        [name]: type === 'checkbox' ? checked : value
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setUser(formData);
    setEditMode(false);
    
    // Si la langue a changé, l'appliquer
    if (formData.language !== user.language) {
      i18n.changeLanguage(formData.language);
    }
    
    // Ici, vous enverriez normalement les données à votre backend
    console.log('Profil mis à jour:', formData);
  };

  const handleProfilePictureChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({
          ...formData,
          profilePicture: reader.result
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogout = () => {
    // Logique de déconnexion ici
    console.log('Déconnexion...');
    navigate('/login');
  };

  return (
    <div className="profile-container">
      <div className="profile-header">
        <button 
          className="back-button" 
          onClick={() => navigate('/')}
          aria-label={t('common.back')}
        >
          <ArrowLeftIcon className="icon" width={20} height={20} />
          <span>{t('common.back')}</span>
        </button>
        <h1>{t('profile.title')}</h1>
      </div>

      <div className="profile-content">
        <div className="profile-sidebar">
          <div className="profile-picture-container">
            <div className="profile-picture">
              {formData.profilePicture ? (
                <img src={formData.profilePicture} alt={`${formData.firstName} ${formData.lastName}`} />
              ) : (
                <div className="profile-picture-placeholder">
                  {formData.firstName.charAt(0)}{formData.lastName.charAt(0)}
                </div>
              )}
              {editMode && (
                <label htmlFor="profile-picture-input" className="profile-picture-edit">
                  <CameraIcon width={20} height={20} />
                  <input 
                    id="profile-picture-input" 
                    type="file" 
                    accept="image/*" 
                    onChange={handleProfilePictureChange} 
                    style={{ display: 'none' }} 
                  />
                </label>
              )}
            </div>
            <h2>{formData.firstName} {formData.lastName}</h2>
            <p className="profile-email">{formData.email}</p>
          </div>

          <nav className="profile-nav">
            <button 
              className={`profile-nav-item ${activeTab === 'personal' ? 'active' : ''}`}
              onClick={() => setActiveTab('personal')}
            >
              <UserIcon width={20} height={20} />
              <span>{t('profile.tabs.personal')}</span>
            </button>
            <button 
              className={`profile-nav-item ${activeTab === 'security' ? 'active' : ''}`}
              onClick={() => setActiveTab('security')}
            >
              <LockClosedIcon width={20} height={20} />
              <span>{t('profile.tabs.security')}</span>
            </button>
            <button 
              className={`profile-nav-item ${activeTab === 'preferences' ? 'active' : ''}`}
              onClick={() => setActiveTab('preferences')}
            >
              <LanguageIcon width={20} height={20} />
              <span>{t('profile.tabs.preferences')}</span>
            </button>
            <button 
              className={`profile-nav-item ${activeTab === 'notifications' ? 'active' : ''}`}
              onClick={() => setActiveTab('notifications')}
            >
              <BellIcon width={20} height={20} />
              <span>{t('profile.tabs.notifications')}</span>
            </button>
          </nav>

          <div className="profile-actions">
            <button 
              className="logout-button"
              onClick={() => setShowConfirmLogout(true)}
            >
              <ArrowRightOnRectangleIcon width={20} height={20} />
              <span>{t('profile.logout')}</span>
            </button>
          </div>
        </div>

        <div className="profile-main">
          <div className="profile-card">
            <div className="profile-card-header">
              <h3>
                {activeTab === 'personal' && t('profile.tabs.personal')}
                {activeTab === 'security' && t('profile.tabs.security')}
                {activeTab === 'preferences' && t('profile.tabs.preferences')}
                {activeTab === 'notifications' && t('profile.tabs.notifications')}
              </h3>
              {!editMode ? (
                <button 
                  className="edit-button"
                  onClick={() => setEditMode(true)}
                >
                  <PencilIcon width={16} height={16} />
                  <span>{t('profile.edit')}</span>
                </button>
              ) : (
                <div className="edit-actions">
                  <button 
                    className="cancel-button"
                    onClick={() => {
                      setFormData({...user});
                      setEditMode(false);
                    }}
                  >
                    {t('common.cancel')}
                  </button>
                  <button 
                    className="save-button"
                    onClick={handleSubmit}
                  >
                    {t('common.save')}
                  </button>
                </div>
              )}
            </div>

            <div className="profile-card-content">
              {activeTab === 'personal' && (
                <form className="profile-form">
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="firstName">{t('profile.firstName')}</label>
                      <div className="input-with-icon">
                        <UserIcon className="input-icon" width={20} height={20} />
                        <input
                          type="text"
                          id="firstName"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleChange}
                          disabled={!editMode}
                          className="with-icon"
                        />
                      </div>
                    </div>
                    <div className="form-group">
                      <label htmlFor="lastName">{t('profile.lastName')}</label>
                      <div className="input-with-icon">
                        <UserIcon className="input-icon" width={20} height={20} />
                        <input
                          type="text"
                          id="lastName"
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleChange}
                          disabled={!editMode}
                          className="with-icon"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="email">{t('profile.email')}</label>
                      <div className="input-with-icon">
                        <EnvelopeIcon className="input-icon" width={20} height={20} />
                        <input
                          type="email"
                          id="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          disabled={!editMode}
                          className="with-icon"
                        />
                      </div>
                    </div>
                    <div className="form-group">
                      <label htmlFor="phone">{t('profile.phone')}</label>
                      <div className="input-with-icon">
                        <PhoneIcon className="input-icon" width={20} height={20} />
                        <input
                          type="tel"
                          id="phone"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          disabled={!editMode}
                          className="with-icon"
                        />
                      </div>
                    </div>
                  </div>
                </form>
              )}

              {activeTab === 'security' && (
                <div className="security-section">
                  <div className="password-section">
                    <h4>{t('profile.security.changePassword')}</h4>
                    <form className="profile-form">
                      <div className="form-group">
                        <label htmlFor="currentPassword">{t('profile.security.currentPassword')}</label>
                        <div className="input-with-icon">
                          <LockClosedIcon className="input-icon" width={20} height={20} />
                          <input
                            type="password"
                            id="currentPassword"
                            name="currentPassword"
                            disabled={!editMode}
                            className="with-icon"
                          />
                        </div>
                      </div>
                      <div className="form-group">
                        <label htmlFor="newPassword">{t('profile.security.newPassword')}</label>
                        <div className="input-with-icon">
                          <LockClosedIcon className="input-icon" width={20} height={20} />
                          <input
                            type="password"
                            id="newPassword"
                            name="newPassword"
                            disabled={!editMode}
                            className="with-icon"
                          />
                        </div>
                      </div>
                      <div className="form-group">
                        <label htmlFor="confirmPassword">{t('profile.security.confirmPassword')}</label>
                        <div className="input-with-icon">
                          <LockClosedIcon className="input-icon" width={20} height={20} />
                          <input
                            type="password"
                            id="confirmPassword"
                            name="confirmPassword"
                            disabled={!editMode}
                            className="with-icon"
                          />
                        </div>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {activeTab === 'preferences' && (
                <div className="preferences-section">
                  <div className="language-section">
                    <h4>{t('profile.preferences.language')}</h4>
                    <div className="form-group">
                      <label htmlFor="language">{t('profile.preferences.selectLanguage')}</label>
                      <select
                        id="language"
                        name="language"
                        value={formData.language}
                        onChange={handleChange}
                        disabled={!editMode}
                        className="language-select"
                      >
                        <option value="fr">{t('profile.preferences.french')}</option>
                        <option value="en">{t('profile.preferences.english')}</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'notifications' && (
                <div className="notifications-section">
                  <h4>{t('profile.notifications.settings')}</h4>
                  <div className="notification-option">
                    <div className="notification-info">
                      <h5>{t('profile.notifications.email')}</h5>
                      <p>{t('profile.notifications.emailDescription')}</p>
                    </div>
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        name="notifications.email"
                        checked={formData.notifications.email}
                        onChange={handleChange}
                        disabled={!editMode}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>
                  <div className="notification-option">
                    <div className="notification-info">
                      <h5>{t('profile.notifications.browser')}</h5>
                      <p>{t('profile.notifications.browserDescription')}</p>
                    </div>
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        name="notifications.browser"
                        checked={formData.notifications.browser}
                        onChange={handleChange}
                        disabled={!editMode}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal de confirmation de déconnexion */}
      {showConfirmLogout && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>{t('profile.logoutConfirmTitle')}</h3>
            <p>{t('profile.logoutConfirmMessage')}</p>
            <div className="modal-actions">
              <button 
                className="cancel-button"
                onClick={() => setShowConfirmLogout(false)}
              >
                {t('common.cancel')}
              </button>
              <button 
                className="logout-confirm-button"
                onClick={handleLogout}
              >
                {t('profile.confirmLogout')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;

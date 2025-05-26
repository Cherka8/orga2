import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { BuildingOfficeIcon, UserIcon } from '@heroicons/react/24/outline';
import CompanyForm from './CompanyForm';
import IndividualForm from './IndividualForm';
import '../../styles/auth.css';

const RegisterPage = () => {
  const { t } = useTranslation();
  const [userType, setUserType] = useState(null);

  const handleSelection = (type) => {
    setUserType(type);
  };

  return (
    <div className="register-container">
      <div className="register-card">
        <h1 className="register-title">{t('auth.register.title')}</h1>
        
        {!userType ? (
          <div className="user-type-selection">
            <h2>{t('auth.register.userTypeQuestion')}</h2>
            <div className="selection-buttons">
              <button
                className="selection-button"
                onClick={() => handleSelection('company')}
              >
                <BuildingOfficeIcon className="icon" width={40} height={40} />
                {t('auth.register.companyButton')}
              </button>
              <button
                className="selection-button"
                onClick={() => handleSelection('individual')}
              >
                <UserIcon className="icon" width={40} height={40} />
                {t('auth.register.individualButton')}
              </button>
            </div>
          </div>
        ) : (
          <>
            <button 
              className="back-button"
              onClick={() => setUserType(null)}
            >
              ← {t('auth.register.backButton')}
            </button>
            
            {userType === 'company' ? (
              <CompanyForm />
            ) : (
              <IndividualForm />
            )}
          </>
        )}
        
        <div className="auth-footer">
          <p>{t('auth.register.alreadyRegistered')} <Link to="/login">{t('auth.register.loginLink')}</Link></p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;


import React from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import Logo from './Logo';

const BiometricAuth: React.FC = () => {
  const { users, login } = useAuth();
  const { t } = useLanguage();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-[var(--bg-primary)] flex flex-col items-center justify-center z-50 p-4 text-center"
    >
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <Logo size={48} color="var(--text-white)" withText className="mb-6" />
      </motion.div>
      <p className="text-[var(--text-secondary)] mt-2 mb-12">{t('auth.selectProfile')}</p>
      
      <div className="w-full max-w-sm space-y-3">
          {users.map((user, index) => (
              <motion.button
                  key={user.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  onClick={() => login(user.id)}
                  className="w-full flex items-center space-x-4 p-3 rounded-lg text-left transition-colors bg-[var(--bg-secondary-translucent)] hover:bg-[var(--bg-interactive-hover)]"
              >
                  <img src={user.avatarUrl} alt={user.name} className="w-12 h-12 rounded-full border-2 border-[var(--border-primary)]" />
                  <div>
                    <p className="font-bold text-[var(--text-white)]">{user.name}</p>
                    <p className="text-sm text-[var(--text-secondary)]">{user.role}</p>
                  </div>
              </motion.button>
          ))}
      </div>
      
    </motion.div>
  );
};

export default BiometricAuth;

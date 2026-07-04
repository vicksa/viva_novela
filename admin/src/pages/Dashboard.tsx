import React, { useEffect } from 'react';
import { Users, BookOpen, Activity } from 'lucide-react';
import { useAdminStore } from '../store/adminStore';

export const Dashboard: React.FC = () => {
  const { usuarios, historias, fetchUsuarios, fetchHistorias } = useAdminStore();

  useEffect(() => {
    fetchUsuarios();
    fetchHistorias();
  }, [fetchUsuarios, fetchHistorias]);

  return (
    <div>
      <h1 style={{ fontSize: '2rem', marginBottom: '2rem', fontWeight: 'bold' }}>Dashboard</h1>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div style={{ background: 'rgba(139, 92, 246, 0.2)', padding: '1rem', borderRadius: '12px' }}>
            <Users size={24} color="var(--accent-primary)" />
          </div>
          <div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Total de Usuários</p>
            <p style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{usuarios.length}</p>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div style={{ background: 'rgba(236, 72, 153, 0.2)', padding: '1rem', borderRadius: '12px' }}>
            <BookOpen size={24} color="var(--accent-secondary)" />
          </div>
          <div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Total de Histórias</p>
            <p style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{historias.length}</p>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div style={{ background: 'rgba(16, 185, 129, 0.2)', padding: '1rem', borderRadius: '12px' }}>
            <Activity size={24} color="var(--success)" />
          </div>
          <div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Status do Sistema</p>
            <p style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Online</p>
          </div>
        </div>
      </div>
    </div>
  );
};

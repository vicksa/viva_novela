import React, { useEffect, useState } from 'react';
import { X, Edit2 } from 'lucide-react';
import { useAdminStore, type User } from '../store/adminStore';

export const Usuarios: React.FC = () => {
  const { usuarios, fetchUsuarios, updateUsuario } = useAdminStore();
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  
  // Form state
  const [saldo, setSaldo] = useState('');
  const [plano, setPlano] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchUsuarios();
  }, [fetchUsuarios]);

  const openModal = (user: User) => {
    setSelectedUser(user);
    setSaldo(user.saldo_moedas.toString());
    setPlano(user.plano);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    
    setLoading(true);
    try {
      await updateUsuario(selectedUser.id, {
        saldo_moedas: Number(saldo),
        plano
      });
      setSelectedUser(null);
    } catch (error) {
      console.error(error);
      alert('Erro ao atualizar usuário');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '2rem' }}>Usuários</h1>

      <div className="glass-panel glass-table-container">
        <table className="glass-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nome</th>
              <th>Email</th>
              <th>Papel</th>
              <th>Plano</th>
              <th>Saldo</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map(u => (
              <tr key={u.id}>
                <td>#{u.id}</td>
                <td>{u.nome}</td>
                <td>{u.email}</td>
                <td>
                  <span style={{ 
                    background: u.papel === 'admin' ? 'rgba(139, 92, 246, 0.2)' : 'rgba(255, 255, 255, 0.1)',
                    color: u.papel === 'admin' ? 'var(--accent-primary)' : 'inherit',
                    padding: '0.25rem 0.75rem',
                    borderRadius: '999px',
                    fontSize: '0.75rem',
                    fontWeight: 500
                  }}>
                    {u.papel}
                  </span>
                </td>
                <td>{u.plano}</td>
                <td>{u.saldo_moedas}</td>
                <td>
                  <button 
                    onClick={() => openModal(u)}
                    style={{ background: 'none', border: 'none', color: 'var(--accent-primary)', cursor: 'pointer' }}
                  >
                    <Edit2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
            {usuarios.length === 0 && (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '2rem' }}>Nenhum usuário encontrado.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {selectedUser && (
        <div className="modal-overlay">
          <div className="glass-panel modal-content">
            <div className="modal-header">
              <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>Editar Usuário: {selectedUser.nome}</h2>
              <button className="close-button" onClick={() => setSelectedUser(null)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Saldo de Moedas</label>
                <input 
                  type="number" 
                  className="glass-input" 
                  value={saldo}
                  onChange={e => setSaldo(e.target.value)}
                  required
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Plano</label>
                <select 
                  className="glass-input" 
                  value={plano}
                  onChange={e => setPlano(e.target.value)}
                  required
                  style={{ backgroundColor: 'rgba(15, 17, 26, 0.9)' }}
                >
                  <option value="gratuito">Gratuito</option>
                  <option value="premium">Premium</option>
                  <option value="vip">VIP</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                <button type="button" className="glass-button secondary" onClick={() => setSelectedUser(null)} style={{ flex: 1 }}>
                  Cancelar
                </button>
                <button type="submit" className="glass-button" style={{ flex: 1 }} disabled={loading}>
                  {loading ? 'Salvando...' : 'Salvar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

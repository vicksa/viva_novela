import React, { useEffect, useState } from 'react';
import { Plus, X, Edit2, Trash2 } from 'lucide-react';
import { useAdminStore, type User } from '../store/adminStore';
import { ConfirmDialog } from '../components/ConfirmDialog';

export const Usuarios: React.FC = () => {
  const { usuarios, fetchUsuarios, createUsuario, updateUsuario, deleteUsuario } = useAdminStore();
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [deletingUser, setDeletingUser] = useState<User | null>(null);

  // Form state (edição)
  const [saldo, setSaldo] = useState('');
  const [plano, setPlano] = useState('');
  const [papel, setPapel] = useState('');
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Form state (criação)
  const [novoNome, setNovoNome] = useState('');
  const [novoEmail, setNovoEmail] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [novoPapel, setNovoPapel] = useState('leitor');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchUsuarios();
  }, [fetchUsuarios]);

  const openModal = (user: User) => {
    setSelectedUser(user);
    setSaldo(user.saldo_moedas.toString());
    setPlano(user.plano);
    setPapel(user.papel);
  };

  const resetCreateForm = () => {
    setNovoNome('');
    setNovoEmail('');
    setNovaSenha('');
    setNovoPapel('leitor');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

    setLoading(true);
    try {
      await updateUsuario(selectedUser.id, {
        saldo_moedas: Number(saldo),
        plano,
        papel,
      });
      setSelectedUser(null);
    } catch (error) {
      console.error(error);
      alert('Erro ao atualizar usuário');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      await createUsuario({
        nome: novoNome,
        email: novoEmail,
        senha: novaSenha,
        papel: novoPapel,
      });
      setIsCreateModalOpen(false);
      resetCreateForm();
    } catch (error) {
      console.error(error);
      alert('Erro ao criar usuário');
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingUser) return;
    setDeleting(true);
    try {
      await deleteUsuario(deletingUser.id);
      setDeletingUser(null);
    } catch (error) {
      console.error(error);
      alert('Erro ao excluir usuário');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold' }}>Usuários</h1>
        <button className="glass-button" onClick={() => setIsCreateModalOpen(true)}>
          <Plus size={20} />
          Novo Usuário
        </button>
      </div>

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
                <td>#{u.id.slice(0, 8)}</td>
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
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      onClick={() => openModal(u)}
                      style={{ background: 'none', border: 'none', color: 'var(--accent-primary)', cursor: 'pointer' }}
                      title="Editar"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button
                      onClick={() => setDeletingUser(u)}
                      style={{ background: 'none', border: 'none', color: 'var(--danger, #ef4444)', cursor: 'pointer' }}
                      title="Excluir"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
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
                  <option value="vip">VIP</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Papel</label>
                <select
                  className="glass-input"
                  value={papel}
                  onChange={e => setPapel(e.target.value)}
                  required
                  style={{ backgroundColor: 'rgba(15, 17, 26, 0.9)' }}
                >
                  <option value="leitor">Leitor</option>
                  <option value="admin">Admin</option>
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

      {isCreateModalOpen && (
        <div className="modal-overlay">
          <div className="glass-panel modal-content">
            <div className="modal-header">
              <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>Novo Usuário</h2>
              <button className="close-button" onClick={() => { setIsCreateModalOpen(false); resetCreateForm(); }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreate}>
              <div className="form-group">
                <label className="form-label">Nome</label>
                <input
                  type="text"
                  className="glass-input"
                  value={novoNome}
                  onChange={e => setNovoNome(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  className="glass-input"
                  value={novoEmail}
                  onChange={e => setNovoEmail(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Senha</label>
                <input
                  type="password"
                  className="glass-input"
                  value={novaSenha}
                  onChange={e => setNovaSenha(e.target.value)}
                  minLength={8}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Papel</label>
                <select
                  className="glass-input"
                  value={novoPapel}
                  onChange={e => setNovoPapel(e.target.value)}
                  required
                  style={{ backgroundColor: 'rgba(15, 17, 26, 0.9)' }}
                >
                  <option value="leitor">Leitor</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                <button type="button" className="glass-button secondary" onClick={() => { setIsCreateModalOpen(false); resetCreateForm(); }} style={{ flex: 1 }}>
                  Cancelar
                </button>
                <button type="submit" className="glass-button" style={{ flex: 1 }} disabled={creating}>
                  {creating ? 'Criando...' : 'Criar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deletingUser && (
        <ConfirmDialog
          title="Excluir usuário"
          message={`Tem certeza que deseja excluir "${deletingUser.nome}"? Esta ação não pode ser desfeita.`}
          loading={deleting}
          onConfirm={handleDelete}
          onCancel={() => setDeletingUser(null)}
        />
      )}
    </div>
  );
};

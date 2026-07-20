import React, { useEffect, useState } from 'react';
import { Plus, X, List, Edit2, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAdminStore, type Historia } from '../store/adminStore';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { api } from '../api';

export const Historias: React.FC = () => {
  const { historias, fetchHistorias, createHistoria, updateHistoria, deleteHistoria } = useAdminStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingHistoria, setDeletingHistoria] = useState<Historia | null>(null);

  // Form state
  const [titulo, setTitulo] = useState('');
  const [genero, setGenero] = useState('');
  const [sinopse, setSinopse] = useState('');
  const [autora, setAutora] = useState('');
  const [capaFile, setCapaFile] = useState<File | null>(null);
  const [capaPreview, setCapaPreview] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchHistorias();
  }, [fetchHistorias]);

  const resetForm = () => {
    setTitulo('');
    setGenero('');
    setSinopse('');
    setAutora('');
    setCapaFile(null);
    setCapaPreview(null);
    setEditingId(null);
  };

  const openCreateModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const openEditModal = (historia: Historia) => {
    setEditingId(historia.id);
    setTitulo(historia.titulo);
    setGenero(historia.genero);
    setSinopse(historia.sinopse);
    setAutora(historia.autora || '');
    setCapaFile(null);
    setCapaPreview(historia.capa_url || null);
    setIsModalOpen(true);
  };

  const handleCapaChange = (file: File | null) => {
    setCapaFile(file);
    setCapaPreview(file ? URL.createObjectURL(file) : null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!editingId && !capaFile) {
      alert('Selecione uma imagem de capa.');
      return;
    }

    setLoading(true);
    try {
      let capa_url = undefined;
      if (capaFile) {
        const uploadRes = await api.uploadFile<{ data: { url: string } }>('/admin/upload', capaFile);
        capa_url = uploadRes.data.url;
      }

      const payload = {
        titulo,
        genero,
        sinopse,
        autora,
        ...(capa_url ? { capa_url } : {})
      };

      if (editingId) {
        await updateHistoria(editingId, payload);
      } else {
        await createHistoria(payload);
      }

      setIsModalOpen(false);
      resetForm();
    } catch (error) {
      console.error(error);
      alert(`Erro ao ${editingId ? 'atualizar' : 'criar'} história`);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingHistoria) return;
    setDeleting(true);
    try {
      await deleteHistoria(deletingHistoria.id);
      setDeletingHistoria(null);
    } catch (error) {
      console.error(error);
      alert('Erro ao excluir história');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold' }}>Histórias</h1>
        <button className="glass-button" onClick={openCreateModal}>
          <Plus size={20} />
          Nova História
        </button>
      </div>

      <div className="glass-panel glass-table-container">
        <table className="glass-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Título</th>
              <th>Gênero</th>
              <th>Autora</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {historias.map(h => (
              <tr key={h.id}>
                <td>#{h.id.slice(0, 8)}</td>
                <td>{h.titulo}</td>
                <td>{h.genero}</td>
                <td>{h.autora}</td>
                <td>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <Link to={`/historias/${h.id}/capitulos`} className="glass-button" style={{ display: 'inline-flex', padding: '0.25rem 0.5rem', fontSize: '0.875rem' }}>
                      <List size={16} style={{ marginRight: '0.25rem' }} />
                      Capítulos
                    </Link>
                    <button
                      onClick={() => openEditModal(h)}
                      style={{ background: 'none', border: 'none', color: 'var(--accent-primary)', cursor: 'pointer' }}
                      title="Editar"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button
                      onClick={() => setDeletingHistoria(h)}
                      style={{ background: 'none', border: 'none', color: 'var(--danger, #ef4444)', cursor: 'pointer' }}
                      title="Excluir"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {historias.length === 0 && (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: '2rem' }}>Nenhuma história encontrada.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="glass-panel modal-content">
            <div className="modal-header">
              <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>{editingId ? 'Editar História' : 'Nova História'}</h2>
              <button className="close-button" onClick={() => { setIsModalOpen(false); resetForm(); }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Título</label>
                <input
                  type="text"
                  className="glass-input"
                  value={titulo}
                  onChange={e => setTitulo(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Gênero</label>
                <input
                  type="text"
                  className="glass-input"
                  value={genero}
                  onChange={e => setGenero(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Sinopse</label>
                <textarea
                  className="glass-input"
                  rows={3}
                  value={sinopse}
                  onChange={e => setSinopse(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Autora</label>
                <input
                  type="text"
                  className="glass-input"
                  value={autora}
                  onChange={e => setAutora(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Capa{editingId ? '' : ' (obrigatória)'}</label>
                <input
                  type="file"
                  className="glass-input"
                  accept="image/*"
                  required={!editingId}
                  onChange={e => handleCapaChange(e.target.files ? e.target.files[0] : null)}
                />
                {capaPreview && (
                  <img
                    src={capaPreview}
                    alt="Pré-visualização da capa"
                    style={{ marginTop: '0.75rem', maxHeight: '160px', borderRadius: '8px', display: 'block' }}
                  />
                )}
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                <button type="button" className="glass-button secondary" onClick={() => { setIsModalOpen(false); resetForm(); }} style={{ flex: 1 }}>
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

      {deletingHistoria && (
        <ConfirmDialog
          title="Excluir história"
          message={`Tem certeza que deseja excluir "${deletingHistoria.titulo}"? Todos os capítulos dessa história também serão excluídos. Esta ação não pode ser desfeita.`}
          loading={deleting}
          onConfirm={handleDelete}
          onCancel={() => setDeletingHistoria(null)}
        />
      )}
    </div>
  );
};

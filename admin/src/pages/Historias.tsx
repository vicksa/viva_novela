import React, { useEffect, useState } from 'react';
import { Plus, X, List } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAdminStore } from '../store/adminStore';

export const Historias: React.FC = () => {
  const { historias, fetchHistorias, createHistoria } = useAdminStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Form state
  const [titulo, setTitulo] = useState('');
  const [genero, setGenero] = useState('');
  const [sinopse, setSinopse] = useState('');
  const [autorId, setAutorId] = useState('');
  const [capaFile, setCapaFile] = useState<File | null>(null);
  
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchHistorias();
  }, [fetchHistorias]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      let capa_url = undefined;
      if (capaFile) {
        const formData = new FormData();
        formData.append('file', capaFile);
        
        const token = localStorage.getItem('adminToken');
        const uploadRes = await fetch('http://localhost:3000/api/admin/upload', {
          method: 'POST',
          headers: {
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
          },
          body: formData
        });
        
        if (!uploadRes.ok) {
          throw new Error('Falha no upload da capa');
        }
        
        const uploadData = await uploadRes.json();
        capa_url = uploadData.url;
      }

      await createHistoria({
        titulo,
        genero,
        sinopse,
        autor_id: Number(autorId),
        ...(capa_url ? { capa_url } : {})
      });
      setIsModalOpen(false);
      // Reset form
      setTitulo('');
      setGenero('');
      setSinopse('');
      setAutorId('');
      setCapaFile(null);
    } catch (error) {
      console.error(error);
      alert('Erro ao criar história');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold' }}>Histórias</h1>
        <button className="glass-button" onClick={() => setIsModalOpen(true)}>
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
              <th>Autor ID</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {historias.map(h => (
              <tr key={h.id}>
                <td>#{h.id}</td>
                <td>{h.titulo}</td>
                <td>{h.genero}</td>
                <td>{h.autor_id}</td>
                <td>
                  <Link to={`/historias/${h.id}/capitulos`} className="glass-button" style={{ display: 'inline-flex', padding: '0.25rem 0.5rem', fontSize: '0.875rem' }}>
                    <List size={16} style={{ marginRight: '0.25rem' }} />
                    Capítulos
                  </Link>
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
              <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>Nova História</h2>
              <button className="close-button" onClick={() => setIsModalOpen(false)}>
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
                <label className="form-label">Autor ID</label>
                <input 
                  type="number" 
                  className="glass-input" 
                  value={autorId}
                  onChange={e => setAutorId(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Capa</label>
                <input 
                  type="file"
                  className="glass-input" 
                  accept="image/*"
                  onChange={e => setCapaFile(e.target.files ? e.target.files[0] : null)}
                />
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                <button type="button" className="glass-button secondary" onClick={() => setIsModalOpen(false)} style={{ flex: 1 }}>
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

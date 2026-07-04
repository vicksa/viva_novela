import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Plus, X, ArrowLeft } from 'lucide-react';
import { useAdminStore } from '../store/adminStore';

export const Capitulos: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const historiaId = id || '';
  const { capitulos, fetchCapitulos, createCapitulo } = useAdminStore();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form State
  const [titulo, setTitulo] = useState('');
  const [numero, setNumero] = useState('');
  const [conteudo, setConteudo] = useState('');
  const [isGratuito, setIsGratuito] = useState(true);
  const [custoMoedas, setCustoMoedas] = useState('');

  useEffect(() => {
    if (historiaId) {
      fetchCapitulos(historiaId);
    }
  }, [fetchCapitulos, historiaId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createCapitulo({
        historia_id: historiaId,
        titulo,
        numero: Number(numero),
        conteudo,
        is_gratuito: isGratuito,
        custo_moedas: isGratuito ? 0 : Number(custoMoedas)
      });
      setIsModalOpen(false);
      // Reset form
      setTitulo('');
      setNumero('');
      setConteudo('');
      setIsGratuito(true);
      setCustoMoedas('');
    } catch (error) {
      console.error(error);
      alert('Erro ao criar capítulo');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '2rem', gap: '1rem' }}>
        <Link to="/historias" className="glass-button secondary" style={{ padding: '0.5rem' }}>
          <ArrowLeft size={20} />
        </Link>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', flex: 1 }}>Capítulos da História #{historiaId.slice(0, 8)}</h1>
        <button className="glass-button" onClick={() => setIsModalOpen(true)}>
          <Plus size={20} />
          Novo Capítulo
        </button>
      </div>

      <div className="glass-panel glass-table-container">
        <table className="glass-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nº</th>
              <th>Título</th>
              <th>Gratuito?</th>
              <th>Custo (Moedas)</th>
            </tr>
          </thead>
          <tbody>
            {capitulos.map(c => (
              <tr key={c.id}>
                <td>#{c.id.slice(0, 8)}</td>
                <td>{c.numero}</td>
                <td>{c.titulo}</td>
                <td>{c.is_gratuito ? 'Sim' : 'Não'}</td>
                <td>{c.is_gratuito ? '-' : c.custo_moedas}</td>
              </tr>
            ))}
            {capitulos.length === 0 && (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: '2rem' }}>Nenhum capítulo encontrado.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="glass-panel modal-content">
            <div className="modal-header">
              <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>Novo Capítulo</h2>
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
                <label className="form-label">Número do Capítulo</label>
                <input 
                  type="number" 
                  className="glass-input" 
                  value={numero}
                  onChange={e => setNumero(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Conteúdo</label>
                <textarea 
                  className="glass-input" 
                  rows={5}
                  value={conteudo}
                  onChange={e => setConteudo(e.target.value)}
                  required
                />
              </div>
              <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input 
                  type="checkbox"
                  id="isGratuito"
                  checked={isGratuito}
                  onChange={e => setIsGratuito(e.target.checked)}
                />
                <label htmlFor="isGratuito" className="form-label" style={{ marginBottom: 0 }}>É Gratuito?</label>
              </div>
              {!isGratuito && (
                <div className="form-group" style={{ marginTop: '1rem' }}>
                  <label className="form-label">Custo em Moedas</label>
                  <input 
                    type="number" 
                    className="glass-input" 
                    value={custoMoedas}
                    onChange={e => setCustoMoedas(e.target.value)}
                    required={!isGratuito}
                  />
                </div>
              )}

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

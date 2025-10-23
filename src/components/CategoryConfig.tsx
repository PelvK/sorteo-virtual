import { useState, useEffect } from 'react';
import { Settings } from 'lucide-react';
import { CategoryConfig } from '../types';
import { supabase } from '../lib/supabase';
import './CategoryConfig.css';

interface CategoryConfigProps {
  categories: CategoryConfig[];
  onCategoriesChange: (categories: CategoryConfig[]) => void;
  isDrawing: boolean;
}

export function CategoryConfigPanel({
  categories,
  onCategoriesChange,
  isDrawing,
}: CategoryConfigProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [editingCategories, setEditingCategories] = useState<CategoryConfig[]>(categories);

  useEffect(() => {
    setEditingCategories(categories);
  }, [categories]);

  const handleNumZonesChange = (year: number, numZones: number) => {
    if (numZones >= 4 && numZones <= 8) {
      setEditingCategories(prev =>
        prev.map(cat =>
          cat.year === year ? { ...cat, numZones } : cat
        )
      );
    }
  };

  const handleSave = async () => {
    onCategoriesChange(editingCategories);

    try {
      const { error } = await supabase
        .from('category_configs')
        .upsert(
          editingCategories.map(cat => ({
            year: cat.year,
            num_zones: cat.numZones,
            ball_cage_teams: cat.ballCageTeams,
            updated_at: new Date().toISOString(),
          })),
          { onConflict: 'year' }
        );

      if (error) {
        console.error('Error saving category configs:', error);
      }
    } catch (error) {
      console.error('Error saving category configs:', error);
    }

    setIsOpen(false);
  };

  const handleCancel = () => {
    setEditingCategories(categories);
    setIsOpen(false);
  };

  return (
    <>
      <button
        className="category-config-toggle"
        onClick={() => setIsOpen(!isOpen)}
        disabled={isDrawing}
      >
        <Settings size={24} />
        <span>Configurar Categorías</span>
      </button>

      {isOpen && (
        <div className="category-config-overlay" onClick={handleCancel}>
          <div className="category-config-panel" onClick={(e) => e.stopPropagation()}>
            <div className="category-config-header">
              <h2>Configuración de Categorías</h2>
              <button className="close-button" onClick={handleCancel}>
                ×
              </button>
            </div>

            <div className="category-config-content">
              <p className="config-description">
                Configura el número de zonas para cada categoría (año). Esta configuración
                se aplicará cuando selecciones la categoría correspondiente.
              </p>

              <div className="categories-list">
                {editingCategories.map((cat) => (
                  <div key={cat.year} className="category-item">
                    <label className="category-year">Categoría {cat.year}</label>
                    <div className="zone-input-group">
                      <label htmlFor={`zones-${cat.year}`}>Zonas:</label>
                      <input
                        id={`zones-${cat.year}`}
                        type="number"
                        min="4"
                        max="8"
                        value={cat.numZones}
                        onChange={(e) =>
                          handleNumZonesChange(cat.year, parseInt(e.target.value))
                        }
                      />
                      <span className="zone-hint">(4-8)</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="category-config-actions">
                <button onClick={handleSave} className="save-button">
                  Guardar Configuración
                </button>
                <button onClick={handleCancel} className="cancel-button">
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

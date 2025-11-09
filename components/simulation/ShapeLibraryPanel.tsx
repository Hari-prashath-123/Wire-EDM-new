import React, { useState } from 'react';
import { shapeLibrary, ShapeDefinition, ShapeCategory, ShapeParameter } from './ShapeLibrary';

export type ShapeLibraryPanelProps = {
  onSelectShape: (shape: ShapeDefinition, params?: Record<string, number>) => void;
  selectedShapeId?: string;
};

const categories: ShapeCategory[] = ['Basic', 'Complex', 'Industrial', 'Custom'];

function getPointsCount(shape: ShapeDefinition, params?: Record<string, number>) {
  return shape.points(params).length;
}

export const ShapeLibraryPanel: React.FC<ShapeLibraryPanelProps> = ({ onSelectShape, selectedShapeId }) => {
  const [activeCategory, setActiveCategory] = useState<ShapeCategory>('Industrial');
  const [editShapeId, setEditShapeId] = useState<string | null>(null);
  const [paramValues, setParamValues] = useState<Record<string, number>>({});

  const shapes = shapeLibrary.filter(s => s.category === activeCategory);

  const handleEdit = (shape: ShapeDefinition) => {
    setEditShapeId(shape.id);
    // Set default values
    if (shape.parameters) {
      const defaults: Record<string, number> = {};
      shape.parameters.forEach(p => { defaults[p.key] = p.default });
      setParamValues(defaults);
    }
  };

  const handleParamChange = (key: string, value: number) => {
    setParamValues(prev => ({ ...prev, [key]: value }));
  };

  const handleApply = (shape: ShapeDefinition) => {
    setEditShapeId(null);
    onSelectShape(shape, paramValues);
  };

  const handleExport = () => {
    // Export logic placeholder
    alert('Exported shape data!');
  };

  return (
    <div className="bg-[#2d3442] rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-lg text-[#b7bff8]">Shape Library</h3>
        <button className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded" onClick={handleExport}>Export</button>
      </div>
      <div className="flex gap-2 mb-4">
        {categories.map(cat => (
          <button
            key={cat}
            className={`px-4 py-2 rounded font-semibold ${activeCategory === cat ? 'bg-[#7c3aed] text-white' : 'bg-[#3b4252] text-[#b7bff8]'}`}
            onClick={() => { setActiveCategory(cat); setEditShapeId(null); }}
          >
            {cat}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-4">
        {shapes.map(shape => (
          <div key={shape.id} className={`rounded-lg p-4 bg-[#3b4252] text-[#b7bff8] shadow ${selectedShapeId === shape.id ? 'border-2 border-[#7c3aed]' : 'border border-[#4c566a]'}`}>
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-base">{shape.name}</span>
              <button className="text-xs text-[#7c3aed] underline" onClick={() => handleEdit(shape)}>Edit</button>
            </div>
            <div className="text-sm mb-1">{shape.description}</div>
            <div className="text-xs text-gray-400 mb-2">{getPointsCount(shape, editShapeId === shape.id ? paramValues : undefined)} points</div>
            {editShapeId === shape.id && shape.parameters && (
              <div className="mb-2 space-y-2">
                {shape.parameters.map(param => (
                  <div key={param.key} className="flex items-center gap-2">
                    <label className="text-xs w-24">{param.label}</label>
                    <input
                      type="range"
                      min={param.min}
                      max={param.max}
                      step={param.step ?? 0.01}
                      value={paramValues[param.key] ?? param.default}
                      onChange={e => handleParamChange(param.key, Number(e.target.value))}
                      className="flex-1"
                    />
                    <span className="text-xs w-10 text-right">{paramValues[param.key] ?? param.default}</span>
                  </div>
                ))}
                <button className="mt-2 bg-[#7c3aed] text-white px-3 py-1 rounded" onClick={() => handleApply(shape)}>Apply</button>
              </div>
            )}
            <button
              className={`w-full mt-2 py-2 rounded ${selectedShapeId === shape.id ? 'bg-[#7c3aed] text-white' : 'bg-[#434c5e] text-[#b7bff8]'}`}
              onClick={() => onSelectShape(shape, editShapeId === shape.id ? paramValues : undefined)}
            >
              {selectedShapeId === shape.id ? 'Selected' : 'Select'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

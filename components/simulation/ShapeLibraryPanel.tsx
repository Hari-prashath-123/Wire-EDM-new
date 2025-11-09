import React from 'react';
import { presetShapes } from './shape-library';
import type { Point2D, PresetShape } from './types';

export type ShapeLibraryPanelProps = {
  onShapeChange: (shape: PresetShape) => void;
};

export const ShapeLibraryPanel: React.FC<ShapeLibraryPanelProps> = ({ onShapeChange }) => {
  const shapeButtons = [
    { key: 'rectangle', label: 'Rectangle' },
    { key: 'circle', label: 'Circle' },
    { key: 'star', label: 'Star' },
    { key: 'gear', label: 'Gear' },
    { key: 'wave', label: 'Wave' },
  ];

  return (
    <div className="bg-[#2d3442] rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-lg text-[#b7bff8]">Shape Library</h3>
        <button className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded" onClick={() => {
          // Export all shapes as CSV
          const csv = Object.entries(presetShapes)
            .map(([name, pts]) => `${name}\n${pts.map(p => `${p.x},${p.y}`).join('\n')}`)
            .join('\n\n');
          const blob = new Blob([csv], { type: 'text/csv' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = 'preset-shapes.csv';
          a.click();
          URL.revokeObjectURL(url);
        }}>Export</button>
      </div>
      <div className="grid grid-cols-2 gap-4">
        {shapeButtons.map(btn => (
          <button
            key={btn.key}
            className="rounded-lg p-4 bg-[#3b4252] text-[#b7bff8] shadow border border-[#4c566a] font-bold text-base hover:bg-[#434c5e]"
            onClick={() => onShapeChange({
              type: 'preset',
              name: btn.label,
              points: presetShapes[btn.key]
            })}
          >
            {btn.label}
            <div className="text-xs text-gray-400 mt-1">{presetShapes[btn.key]?.length ?? 0} points</div>
          </button>
        ))}
      </div>
    </div>
  );
};

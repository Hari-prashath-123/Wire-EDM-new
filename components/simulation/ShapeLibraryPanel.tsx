import React, { useState } from 'react';
import {
  generateRectangle,
  generateCircle,
  generateStar,
  generateGear,
  generateWave,
  staticPresetShapes
} from './shape-library';
import type { Point2D, PresetShape } from './types';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

export type ShapeLibraryPanelProps = {
  onShapeChange: (shape: PresetShape) => void;
};

export const ShapeLibraryPanel: React.FC<ShapeLibraryPanelProps> = ({ onShapeChange }) => {
  const [selectedShapeConfig, setSelectedShapeConfig] = useState<any | null>(null);
  const [params, setParams] = useState<Record<string, number>>({});

  const shapeConfigs = [
    {
      key: 'rectangle',
      label: 'Rectangle',
      generator: generateRectangle,
      params: [
  { key: 'width', label: 'Width', default: 80 },
  { key: 'height', label: 'Height', default: 60 },
  { key: 'thickness', label: 'Material Thickness', default: 10 },
      ]
    },
    {
      key: 'circle',
      label: 'Circle',
      generator: generateCircle,
      params: [
        { key: 'radius', label: 'Radius', default: 40 },
        { key: 'segments', label: 'Segments', default: 32 }
      ]
    },
    {
      key: 'star',
      label: 'Star',
      generator: generateStar,
      params: [
        { key: 'outerRadius', label: 'Outer Radius', default: 40 },
        { key: 'innerRadius', label: 'Inner Radius', default: 15 },
        { key: 'numPoints', label: 'Points', default: 5 }
      ]
    },
    {
      key: 'gear',
      label: 'Gear',
      generator: generateGear,
      params: [
        { key: 'scale', label: 'Scale', default: 1.5 }
      ]
    },
    {
      key: 'wave',
      label: 'Wave',
      generator: generateWave,
      params: [
        { key: 'amplitude', label: 'Amplitude', default: 20 },
        { key: 'length', label: 'Length', default: 80 },
        { key: 'segments', label: 'Segments', default: 20 }
      ]
    }
  ];

  return (
    <div className="bg-[#2d3442] rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-lg text-[#b7bff8]">Shape Library</h3>
        <button className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded" onClick={() => {
          // Export all shapes as CSV
          const csv = Object.entries(staticPresetShapes)
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
        {shapeConfigs.map(config => (
          <button
            key={config.key}
            className={`rounded-lg p-4 font-bold text-base shadow border ${selectedShapeConfig?.key === config.key ? 'bg-blue-700 text-white border-blue-400' : 'bg-[#3b4252] text-[#b7bff8] border-[#4c566a] hover:bg-[#434c5e]'}`}
            onClick={() => {
              setSelectedShapeConfig(config);
              setParams(config.params.reduce((acc: any, p: any) => ({ ...acc, [p.key]: p.default }), {}));
            }}
          >
            {config.label}
            <div className="text-xs text-gray-400 mt-1">{staticPresetShapes[config.key]?.length ?? 0} points</div>
          </button>
        ))}
      </div>
      {selectedShapeConfig && (
        <div className="mt-4 space-y-4 border-t border-[#4c566a] pt-4">
          <h4 className="font-bold text-md text-[#b7bff8]">
            {selectedShapeConfig.label} Parameters
          </h4>
          <div className="grid grid-cols-2 gap-4">
            {selectedShapeConfig.params.map((param: any) => (
              <div key={param.key} className="space-y-2">
                <Label htmlFor={param.key} className="text-sm font-medium text-[#d8dee9]">
                  {param.label}
                </Label>
                <Input
                  id={param.key}
                  type="number"
                  value={
                    params[param.key] === undefined || isNaN(params[param.key])
                      ? ''
                      : String(params[param.key])
                  }
                  onChange={e => setParams(prev => ({ ...prev, [param.key]: parseFloat(e.target.value) }))}
                  className="bg-[#3b4252] border-[#4c566a] text-white"
                />
              </div>
            ))}
          </div>
            <div className="grid grid-cols-2 gap-4">
              {selectedShapeConfig.params.map((param: any) => (
                <div key={param.key} className="space-y-2">
                  <Label htmlFor={param.key} className="text-sm font-medium text-[#d8dee9]">
                    {param.label}
                  </Label>
                  <Input
                    id={param.key}
                    type="number"
                    value={
                      params[param.key] === undefined || isNaN(params[param.key])
                        ? ''
                        : String(params[param.key])
                    }
                    onChange={e => setParams(prev => ({ ...prev, [param.key]: parseFloat(e.target.value) }))}
                    className="bg-[#3b4252] border-[#4c566a] text-white"
                  />
                </div>
              ))}
            </div>
          <button
            onClick={() => {
              const paramValues = selectedShapeConfig.params.map((p: any) => params[p.key]);
              const points = selectedShapeConfig.generator(...paramValues);
              onShapeChange({
                type: 'preset',
                name: selectedShapeConfig.label,
                points: points
              });
            }}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded font-bold"
          >
            Generate Shape
          </button>
        </div>
      )}
    </div>
  );
};

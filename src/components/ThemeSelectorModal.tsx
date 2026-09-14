import React from 'react';
import { Palette, Check, Sparkles, X, Sun, Moon } from 'lucide-react';
import { ThemeId, ThemeConfig } from '../types';
import { THEMES } from '../lib/themes';

interface ThemeSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTheme: ThemeId;
  onSelectTheme: (themeId: ThemeId) => void;
}

export const ThemeSelectorModal: React.FC<ThemeSelectorModalProps> = ({
  isOpen,
  onClose,
  currentTheme,
  onSelectTheme,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-100 space-y-5 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">
                  Paleta de Temas ARKIH
                </h3>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-100 text-indigo-700">
                  7 Temas
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Escolha o visual ideal para seu ambiente de trabalho, descanso ou alta concentração.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Themes Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {THEMES.map((theme: ThemeConfig) => {
            const isSelected = currentTheme === theme.id;

            return (
              <button
                key={theme.id}
                onClick={() => {
                  onSelectTheme(theme.id);
                }}
                className={`relative text-left p-4 rounded-2xl border transition-all cursor-pointer group flex flex-col justify-between ${
                  isSelected
                    ? 'ring-2 ring-indigo-500 border-indigo-500 bg-indigo-50/20 shadow-sm'
                    : 'border-slate-200 hover:border-slate-300 hover:shadow-2xs'
                }`}
                style={{
                  backgroundColor: isSelected ? undefined : undefined,
                }}
              >
                {/* Top preview row */}
                <div>
                  <div className="flex items-center justify-between mb-2.5">
                    <div className="flex items-center gap-2">
                      {theme.category === 'dark' ? (
                        <Moon className="w-4 h-4 text-slate-400" />
                      ) : (
                        <Sun className="w-4 h-4 text-amber-500" />
                      )}
                      <span className="text-xs font-bold text-slate-900">
                        {theme.name}
                      </span>
                    </div>

                    {isSelected ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                        <Check className="w-3 h-3 text-emerald-600" />
                        Ativo
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-400 font-medium group-hover:text-indigo-600 transition-colors">
                        Selecionar
                      </span>
                    )}
                  </div>

                  <p className="text-[11px] font-medium text-slate-500 mb-1">
                    {theme.tagline}
                  </p>
                  <p className="text-[10px] text-slate-400 leading-relaxed mb-3">
                    {theme.description}
                  </p>
                </div>

                {/* Color Swatch Preview Bar */}
                <div
                  className="rounded-xl p-2.5 flex items-center justify-between border"
                  style={{
                    backgroundColor: theme.bgHex,
                    borderColor: theme.borderHex,
                  }}
                >
                  <div className="flex items-center gap-1.5">
                    {/* Background Swatch */}
                    <div
                      className="w-5 h-5 rounded-md border shadow-2xs"
                      style={{ backgroundColor: theme.bgHex, borderColor: theme.borderHex }}
                      title="Canvas"
                    />
                    {/* Card Surface */}
                    <div
                      className="w-5 h-5 rounded-md border shadow-2xs"
                      style={{ backgroundColor: theme.cardHex, borderColor: theme.borderHex }}
                      title="Cartões / Painéis"
                    />
                    {/* Accent Color */}
                    <div
                      className="w-5 h-5 rounded-md shadow-2xs flex items-center justify-center text-white text-[8px] font-bold"
                      style={{ backgroundColor: theme.primaryHex }}
                      title="Acentos & Destaques"
                    >
                      ●
                    </div>
                  </div>

                  {/* Visual preview mini chip */}
                  <span
                    className="text-[9px] font-semibold px-2 py-0.5 rounded-md"
                    style={{
                      backgroundColor: theme.cardHex,
                      color: theme.primaryHex,
                      border: `1px solid ${theme.borderHex}`,
                    }}
                  >
                    Preview UI
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
            <span>Sua preferência é salva automaticamente para próximas visitas.</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white cursor-pointer shadow-xs transition-colors"
          >
            Concluir
          </button>
        </div>
      </div>
    </div>
  );
};

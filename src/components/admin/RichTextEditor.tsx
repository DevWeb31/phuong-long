/**
 * RichTextEditor Component
 * 
 * Éditeur de texte enrichi simple avec sélection de couleur
 * Permet d'éditer le texte normalement et d'appliquer des couleurs facilement
 * 
 * @version 1.0
 * @date 2025-01-XX
 */

'use client';

import { useState, useRef, useEffect } from 'react';
import { Palette, Eye, Edit2, Eraser } from 'lucide-react';
import { Button } from '@/components/common';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  maxLength?: number;
  showHelpText?: boolean;
}

const COLOR_OPTIONS = [
  { name: 'primary', label: 'Primaire', class: 'text-primary dark:text-primary-light font-semibold', color: '#3B82F6' },
  { name: 'secondary', label: 'Secondaire', class: 'text-secondary dark:text-secondary-light font-semibold', color: '#6366F1' },
  { name: 'accent', label: 'Accent', class: 'text-accent dark:text-accent font-semibold', color: '#F59E0B' },
];

// Extraire le texte brut du HTML
function getPlainText(html: string): string {
  if (!html) return '';
  const div = document.createElement('div');
  div.innerHTML = html;
  return div.textContent || div.innerText || '';
}

// Parser le HTML pour extraire le texte et les positions des spans colorés
function parseHtmlToColorMap(html: string, plainText: string): Map<number, string> {
  const colorMap = new Map<number, string>();
  if (!html || !plainText) return colorMap;
  
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  
  let textPos = 0;
  
  function traverse(node: Node, currentColor?: string) {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent || '';
      if (text && currentColor) {
        // Marquer cette portion de texte avec la couleur
        for (let i = 0; i < text.length; i++) {
          colorMap.set(textPos + i, currentColor);
        }
      }
      textPos += text.length;
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      const element = node as HTMLElement;
      if (element.tagName === 'SPAN' && element.className) {
        // Trouver la couleur correspondante
        let colorClass: string | undefined = undefined;
        COLOR_OPTIONS.forEach(color => {
          if (element.className.includes(color.name)) {
            colorClass = color.class;
          }
        });
        
        // Parcourir les enfants avec cette couleur
        Array.from(element.childNodes).forEach(child => traverse(child, colorClass));
      } else {
        // Parcourir les enfants sans couleur
        Array.from(node.childNodes).forEach(child => traverse(child, currentColor));
      }
    }
  }
  
  traverse(doc.body);
  return colorMap;
}

function buildHtmlFromColorMap(text: string, colorMap: Map<number, string>): string {
  let html = '';
  let currentColor: string | undefined = undefined;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const charColor = colorMap.get(i);

    if (charColor !== currentColor) {
      if (currentColor) {
        html += '</span>';
      }
      if (charColor) {
        html += `<span class="${charColor}">`;
        currentColor = charColor;
      } else {
        currentColor = undefined;
      }
    }

    html += char === '\n' ? '<br>' : char;
  }

  if (currentColor) {
    html += '</span>';
  }

  return html;
}

export function RichTextEditor({ value, onChange, placeholder = 'Contenu...', rows = 6, maxLength, showHelpText = true }: RichTextEditorProps) {
  const [plainText, setPlainText] = useState('');
  const [colorMap, setColorMap] = useState<Map<number, string>>(new Map());
  const [selectedRange, setSelectedRange] = useState<{ start: number; end: number } | null>(null);
  const [previewMode, setPreviewMode] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Initialiser depuis le HTML
  useEffect(() => {
    const text = getPlainText(value);
    setPlainText(text);
    
    // Parser les segments colorés
    const newColorMap = parseHtmlToColorMap(value, text);
    setColorMap(newColorMap);
  }, [value]);

  const handleTextChange = (newText: string) => {
    // Limiter la longueur si maxLength est défini
    const limitedText = maxLength && newText.length > maxLength 
      ? newText.slice(0, maxLength) 
      : newText;
    
    setPlainText(limitedText);
    
    const html = buildHtmlFromColorMap(limitedText, colorMap);
    onChange(html);
  };

  const handleSelect = () => {
    if (!textareaRef.current) return;
    const start = textareaRef.current.selectionStart;
    const end = textareaRef.current.selectionEnd;
    setSelectedRange({ start, end });
  };

  const applyColor = (colorClass: string) => {
    if (!selectedRange || selectedRange.start === selectedRange.end) {
      alert('Veuillez d\'abord sélectionner du texte');
      return;
    }

    const newColorMap = new Map(colorMap);
    
    // Appliquer la couleur à la sélection
    for (let i = selectedRange.start; i < selectedRange.end; i++) {
      newColorMap.set(i, colorClass);
    }
    
    setColorMap(newColorMap);
    
    const html = buildHtmlFromColorMap(plainText, newColorMap);
    onChange(html);
    setSelectedRange(null);
    
    // Restaurer le focus
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(selectedRange.start, selectedRange.end);
      }
    }, 0);
  };

  const selectedText = selectedRange 
    ? plainText.slice(selectedRange.start, selectedRange.end)
    : '';

  const selectionHasColor = selectedRange
    ? (() => {
        for (let i = selectedRange.start; i < selectedRange.end; i++) {
          if (colorMap.has(i)) {
            return true;
          }
        }
        return false;
      })()
    : false;

  const removeColor = () => {
    if (!selectedRange || selectedRange.start === selectedRange.end) {
      alert('Veuillez d\'abord sélectionner du texte');
      return;
    }

    const newColorMap = new Map(colorMap);
    for (let i = selectedRange.start; i < selectedRange.end; i++) {
      newColorMap.delete(i);
    }

    setColorMap(newColorMap);

    const html = buildHtmlFromColorMap(plainText, newColorMap);
    onChange(html);
    const range = { ...selectedRange };
    setSelectedRange(null);

    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(range.start, range.end);
      }
    }, 0);
  };

  return (
    <div className="space-y-3">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border dark:border-gray-700">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
            {selectedText ? (
              <>Texte sélectionné : "<span className="font-semibold">{selectedText}</span>"</>
            ) : (
              'Sélectionnez du texte ci-dessous puis choisissez une couleur'
            )}
          </span>
          {COLOR_OPTIONS.map((color) => (
            <Button
              key={color.name}
              variant={selectedText ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => applyColor(color.class)}
              disabled={!selectedText}
              className="text-xs px-3 py-1.5 h-auto flex items-center gap-1.5"
              title={`Appliquer la couleur ${color.label}`}
            >
              <div 
                className="w-3 h-3 rounded-full border border-gray-300 dark:border-gray-600"
                style={{ backgroundColor: color.color }}
              />
              {color.label}
            </Button>
          ))}
          <Button
            variant={selectionHasColor ? 'ghost' : 'ghost'}
            size="sm"
            onClick={removeColor}
            disabled={!selectionHasColor}
            className="text-xs px-3 py-1.5 h-auto flex items-center gap-1.5"
            title="Supprimer la couleur sur la sélection"
          >
            <Eraser className="w-3 h-3" />
            Supprimer la couleur
          </Button>
        </div>
        <div className="ml-auto">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setPreviewMode(!previewMode)}
            className="text-xs px-3 py-1.5 h-auto flex items-center gap-1.5"
          >
            {previewMode ? (
              <>
                <Edit2 className="w-3 h-3" />
                Éditer
              </>
            ) : (
              <>
                <Eye className="w-3 h-3" />
                Aperçu
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Editor */}
      {previewMode ? (
        <div 
          className="w-full px-4 py-3 border dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 rounded-lg min-h-[150px] bg-white prose prose-sm max-w-none"
          dangerouslySetInnerHTML={{ __html: value || '<p class="text-gray-400 italic">Aucun contenu</p>' }}
        />
      ) : (
        <textarea
          ref={textareaRef}
          value={plainText}
          onChange={(e) => handleTextChange(e.target.value)}
          onSelect={handleSelect}
          rows={rows}
          className="w-full px-4 py-2 border dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
          placeholder={placeholder}
        />
      )}

      {/* Info */}
      <div className="space-y-2">
        {showHelpText && (
          <div className="flex items-start gap-2 p-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <Palette className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-blue-800 dark:text-blue-200">
              <strong>Comment utiliser :</strong> Tapez votre texte normalement. Pour mettre du texte en couleur, sélectionnez-le avec la souris puis cliquez sur une couleur (Primaire, Secondaire ou Accent). Utilisez "Aperçu" pour voir le rendu final.
            </p>
          </div>
        )}
        {maxLength && (
          <div className="flex items-center justify-end">
            <span className={`text-xs ${
              plainText.length > maxLength 
                ? 'text-red-600 dark:text-red-400 font-semibold' 
                : plainText.length > maxLength * 0.9
                ? 'text-orange-600 dark:text-orange-400'
                : 'text-gray-600 dark:text-gray-400'
            }`}>
              {plainText.length} / {maxLength} caractères
            </span>
          </div>
        )}
      </div>
    </div>
  );
}


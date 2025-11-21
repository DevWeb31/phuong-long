/**
 * PhoneInput Component
 * 
 * Input pour téléphone avec formatage automatique français (01 02 03 04 05)
 * 
 * @version 1.0
 * @date 2025-01-XX
 */

'use client';

interface PhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function PhoneInput({ value, onChange, placeholder, className }: PhoneInputProps) {
  // Formater le numéro de téléphone : garder uniquement les chiffres et ajouter des espaces tous les 2 chiffres
  const formatPhone = (input: string): string => {
    // Garder uniquement les chiffres
    const digits = input.replace(/\D/g, '');
    
    // Limiter à 10 chiffres (format français)
    const limited = digits.slice(0, 10);
    
    // Ajouter des espaces tous les 2 chiffres
    return limited.replace(/(\d{2})(?=\d)/g, '$1 ');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value);
    onChange(formatted);
  };

  return (
    <input
      type="tel"
      value={value}
      onChange={handleChange}
      placeholder={placeholder || "01 23 45 67 89"}
      className={className}
      maxLength={14} // 10 chiffres + 4 espaces = 14 caractères max
    />
  );
}


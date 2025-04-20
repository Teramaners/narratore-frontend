import React, { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { emotionToEnglish, emotionToItalian } from '@/lib/emotions';

interface EmotionGradientProps {
  emotion: string;
  className?: string;
}

export function EmotionGradient({ emotion, className }: EmotionGradientProps) {
  const [gradientPosition, setGradientPosition] = useState(0);
  
  // Determina i colori del gradiente in base all'emozione
  const getGradientColors = (emotion: string) => {
    switch (emotion) {
      case 'happy':
        return {
          from: 'from-yellow-300',
          via: 'via-green-300',
          to: 'to-yellow-200',
          textColor: 'text-gray-800'
        };
      case 'sad':
        return {
          from: 'from-blue-400',
          via: 'via-indigo-400',
          to: 'to-blue-300',
          textColor: 'text-white'
        };
      case 'curious':
        return {
          from: 'from-purple-400',
          via: 'via-violet-300',
          to: 'to-purple-300',
          textColor: 'text-white'
        };
      case 'scared':
        return {
          from: 'from-red-500',
          via: 'via-red-400',
          to: 'to-orange-400',
          textColor: 'text-white'
        };
      case 'excited':
        return {
          from: 'from-orange-400',
          via: 'via-yellow-300',
          to: 'to-orange-300',
          textColor: 'text-gray-800'
        };
      case 'confused':
        return {
          from: 'from-gray-500',
          via: 'via-gray-400',
          to: 'to-gray-300',
          textColor: 'text-white'
        };
      case 'neutral':
      case 'neutro':
      default:
        return {
          from: 'from-gray-300',
          via: 'via-gray-200',
          to: 'to-gray-100',
          textColor: 'text-gray-800'
        };
    }
  };

  // Usiamo l'utility per convertire l'emozione da inglese a italiano
  const getEmotionName = (emotion: string) => {
    return emotionToItalian(emotion);
  };

  // Effetto di animazione del gradiente
  useEffect(() => {
    let animationFrame: number;
    let lastTime = 0;
    
    const animate = (time: number) => {
      if (lastTime === 0) {
        lastTime = time;
      }
      
      const delta = time - lastTime;
      
      // Sposta il gradiente lentamente (completa un ciclo in 8 secondi)
      setGradientPosition((prev) => (prev + delta / 8000) % 1);
      
      lastTime = time;
      animationFrame = requestAnimationFrame(animate);
    };
    
    animationFrame = requestAnimationFrame(animate);
    
    // Pulizia dell'animazione
    return () => {
      cancelAnimationFrame(animationFrame);
    };
  }, []);

  const gradientColors = getGradientColors(emotion);
  const transformValue = `translateX(${gradientPosition * 100}%)`;

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-md p-0.5',
        className
      )}
    >
      {/* Background animato */}
      <div
        className={cn(
          'absolute inset-0 bg-gradient-to-r',
          gradientColors.from,
          gradientColors.via,
          gradientColors.to,
          'animate-gradient bg-[length:200%_100%]'
        )}
        style={{
          transform: transformValue,
          width: '200%',
          backgroundPosition: '0 0'
        }}
      />
      
      {/* Contenuto */}
      <div className={cn(
        'relative px-3 py-1 text-xs font-medium',
        gradientColors.textColor
      )}>
        {getEmotionName(emotion)}
      </div>
    </div>
  );
}
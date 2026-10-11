import { CalculationResult } from '../types';
import { formatCurrency, getFrequencyLabel, getTangibleComparisons } from './formatters';

export const generateImpactCardDataUrl = async (calc: CalculationResult): Promise<string> => {
  const canvas = document.createElement('canvas');
  const width = 1080;
  const height = 1350; // 4:5 Instagram / WhatsApp friendly ratio
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas not supported');

  // Background Gradient - Deep Graphite
  const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
  bgGrad.addColorStop(0, '#0c0e12');
  bgGrad.addColorStop(0.5, '#12151b');
  bgGrad.addColorStop(1, '#0a0b0e');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, width, height);

  // Subtle Emerald Glow at Top Right
  const glowGrad = ctx.createRadialGradient(width - 150, 150, 20, width - 150, 150, 500);
  glowGrad.addColorStop(0, 'rgba(16, 185, 129, 0.16)');
  glowGrad.addColorStop(1, 'rgba(16, 185, 129, 0)');
  ctx.fillStyle = glowGrad;
  ctx.fillRect(0, 0, width, height);

  // Outer Border Frame
  ctx.strokeStyle = '#222834';
  ctx.lineWidth = 4;
  ctx.strokeRect(40, 40, width - 80, height - 80);

  // Main Receipt Container Card
  const cardX = 70;
  const cardY = 80;
  const cardW = width - 140;
  const cardH = height - 160;

  ctx.fillStyle = '#161922';
  roundRect(ctx, cardX, cardY, cardW, cardH, 32);
  ctx.fill();
  ctx.strokeStyle = '#282f3d';
  ctx.lineWidth = 2;
  roundRect(ctx, cardX, cardY, cardW, cardH, 32);
  ctx.stroke();

  // Header: App Badge & Title
  ctx.fillStyle = '#10b981';
  roundRect(ctx, 120, 130, 48, 48, 14);
  ctx.fill();

  // App Dollar Icon
  ctx.fillStyle = '#0c0e12';
  ctx.font = 'bold 30px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('$', 144, 164);

  // App Name
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 36px sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('Meus Gastos', 186, 166);

  ctx.fillStyle = '#10b981';
  ctx.font = '600 20px sans-serif';
  ctx.textAlign = 'right';
  ctx.fillText('IMPACTO FINANCEIRO', cardX + cardW - 50, 164);

  // Divider Line
  ctx.strokeStyle = '#232a36';
  ctx.lineWidth = 2;
  ctx.setLineDash([8, 8]);
  ctx.beginPath();
  ctx.moveTo(120, 215);
  ctx.lineTo(cardX + cardW - 50, 215);
  ctx.stroke();
  ctx.setLineDash([]);

  // Habit Name Label
  ctx.fillStyle = '#9ca3af';
  ctx.font = '500 22px sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('HÁBITO ANALISADO', 120, 265);

  // Habit Name Large
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 44px sans-serif';
  const truncatedName = calc.name.length > 28 ? calc.name.substring(0, 26) + '...' : calc.name;
  ctx.fillText(truncatedName, 120, 320);

  // Frequency and Unit Value Badge
  const freqText = `${formatCurrency(calc.value)} / ${getFrequencyLabel(calc.frequency).toLowerCase()}`;
  ctx.fillStyle = '#222834';
  roundRect(ctx, 120, 350, 340, 52, 14);
  ctx.fill();
  ctx.fillStyle = '#34d399';
  ctx.font = '600 22px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(`Frequência: ${freqText}`, 120 + 170, 384);

  // Main Highlight Hero Box - Impacto Anual
  const heroY = 435;
  const heroH = 260;
  ctx.fillStyle = '#1a1f2c';
  roundRect(ctx, 120, heroY, cardW - 100, heroH, 24);
  ctx.fill();
  ctx.strokeStyle = '#10b981';
  ctx.lineWidth = 2;
  roundRect(ctx, 120, heroY, cardW - 100, heroH, 24);
  ctx.stroke();

  ctx.fillStyle = '#94a3b8';
  ctx.font = '600 22px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('ESTE PEQUENO HÁBITO CUSTA POR ANO:', width / 2, heroY + 55);

  // Big Annual Number
  ctx.fillStyle = '#10b981';
  ctx.font = '800 68px sans-serif';
  ctx.fillText(formatCurrency(calc.annualValue), width / 2, heroY + 140);

  ctx.fillStyle = '#cbd5e1';
  ctx.font = '500 22px sans-serif';
  ctx.fillText('saem do seu bolso todos os anos sem você perceber', width / 2, heroY + 195);

  // 2 Side by Side Grid Cards (Mensal & Semanal)
  const colW = (cardW - 124) / 2;
  const gridY = 725;
  const gridH = 150;

  // Monthly Box
  ctx.fillStyle = '#1c212c';
  roundRect(ctx, 120, gridY, colW, gridH, 18);
  ctx.fill();
  ctx.fillStyle = '#9ca3af';
  ctx.font = '500 20px sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('Impacto Mensal', 145, gridY + 45);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 36px sans-serif';
  ctx.fillText(formatCurrency(calc.monthlyValue), 145, gridY + 105);

  // Weekly Box
  ctx.fillStyle = '#1c212c';
  roundRect(ctx, 120 + colW + 24, gridY, colW, gridH, 18);
  ctx.fill();
  ctx.fillStyle = '#9ca3af';
  ctx.font = '500 20px sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('Impacto Semanal', 145 + colW + 24, gridY + 45);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 36px sans-serif';
  ctx.fillText(formatCurrency(calc.weeklyValue), 145 + colW + 24, gridY + 105);

  // Tangible Comparison / Meta Box
  const tangibles = getTangibleComparisons(calc.annualValue);
  const bestTangible = tangibles[0];
  const boxY = 905;
  const boxH = 180;

  ctx.fillStyle = '#182420';
  roundRect(ctx, 120, boxY, cardW - 100, boxH, 20);
  ctx.fill();
  ctx.strokeStyle = '#059669';
  ctx.lineWidth = 1.5;
  roundRect(ctx, 120, boxY, cardW - 100, boxH, 20);
  ctx.stroke();

  ctx.fillStyle = '#34d399';
  ctx.font = 'bold 22px sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText(`💡 O QUE DÁ PARA FAZER COM ESSE VALOR:`, 145, boxY + 45);

  ctx.fillStyle = '#ffffff';
  ctx.font = '500 24px sans-serif';
  const comparisonText = bestTangible
    ? bestTangible.description
    : `Economizando ${calc.reductionPercentage}%, sobram ${formatCurrency(calc.annualSavings)} todo ano no bolso!`;
  ctx.fillText(comparisonText, 145, boxY + 95);

  ctx.fillStyle = '#a7f3d0';
  ctx.font = '600 21px sans-serif';
  ctx.fillText(`Meta de corte (${calc.reductionPercentage}%): Economia anual de ${formatCurrency(calc.annualSavings)}`, 145, boxY + 140);

  // Footer Disclaimer
  ctx.fillStyle = '#64748b';
  ctx.font = '400 18px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('Valores estimados sem considerar juros compostos ou inflação.', width / 2, height - 120);

  ctx.fillStyle = '#475569';
  ctx.font = '500 17px sans-serif';
  ctx.fillText('Gerado por Meus Gastos • 100% Offline e Privado', width / 2, height - 90);

  return canvas.toDataURL('image/png');
};

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

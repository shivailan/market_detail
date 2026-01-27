// utils/cancellationLogic.js

export const calculateRefund = (appointmentDate, price) => {
  const now = new Date();
  const appointment = new Date(appointmentDate);
  const diffInHours = (appointment - now) / (1000 * 60 * 60);

  if (diffInHours >= 48) {
    // 🟢 +48h : 100% Remboursement
    return { refund: price, payout: 0, category: 'anticipée', message: "Remboursement intégral (100%)" };
  } 
  else if (diffInHours >= 24 && diffInHours < 48) {
    // 🟠 48h à 24h : 70% Client / 30% Pro
    const refund = price * 0.7;
    const payout = price * 0.3;
    return { refund, payout, category: 'tardive', message: "Remboursement partiel (70%) - Frais de compensation (30%)" };
  } 
  else {
    // 🔴 -24h : 0% Client / 100% Pro
    return { refund: 0, payout: price, category: 'dernière_minute', message: "Aucun remboursement (Annulation moins de 24h avant)" };
  }
};
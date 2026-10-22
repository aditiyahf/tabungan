// State Saldo & Transaksi
let totalSaldoTabungan = 0;
let totalSaldoDarurat = 0;
let totalSaldoJajan = 0;
let transactions = [];

// Format Rupiah
function formatRupiah(number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0
  }).format(number);
}

// Set tanggal default hari ini pada form transaksi
document.getElementById('trx-date').valueAsDate = new Date();

// Logika Kalkulator Alokasi Bulanan
document.getElementById('budget-form').addEventListener('submit', function (e) {
  e.preventDefault();

  const dailyAllowance = parseFloat(document.getElementById('daily-allowance').value) || 0;
  const totalDays = parseInt(document.getElementById('total-days').value) || 30;
  const savingPercent = parseFloat(document.getElementById('saving-percent').value) || 0;
  const emergencyPercent = parseFloat(document.getElementById('emergency-percent').value) || 0;

  // Hitung total uang saku sebulan
  const totalMonthlyIncome = dailyAllowance * totalDays;

  // Hitung porsi alokasi
  const monthlySaving = (totalMonthlyIncome * savingPercent) / 100;
  const monthlyEmergency = (totalMonthlyIncome * emergencyPercent) / 100;
  const monthlyJajan = totalMonthlyIncome - (monthlySaving + monthlyEmergency);

  // Render ke tampilan ringkasan
  document.getElementById('total-monthly-income').innerText = formatRupiah(totalMonthlyIncome);
  document.getElementById('monthly-saving').innerText = formatRupiah(monthlySaving);
  document.getElementById('monthly-emergency').innerText = formatRupiah(monthlyEmergency);
  document.getElementById('monthly-jajan').innerText = formatRupiah(monthlyJajan);

  // AI Advisor Analyzer
  generateAISuggestion(savingPercent, emergencyPercent, monthlySaving, monthlyEmergency, dailyAllowance);
});

// AI Engine
function generateAISuggestion(savingPct, emergencyPct, savingAmt, emergencyAmt, daily) {
  const aiContainer = document.getElementById('ai-response');
  let advice = "";

  const totalPct = savingPct + emergencyPct;
  if (totalPct > 80) {
    advice = "⚠️ **Peringatan AI:** Alokasi tabungan dan daruratmu sangat tinggi (>80%). Pastikan sisa uang jajanmu masih cukup untuk membeli makan siang sehat di sekolah ya!";
  } else if (savingPct >= 20 && emergencyPct >= 10) {
    advice = `🌟 **Analisis AI Sangat Baik!** Komposisi menabungmu (${savingPct}%) dan dana darurat (${emergencyPct}%) sudah ideal untuk masa depan. Jika konsisten menyisihkan **${formatRupiah(savingAmt)}** setiap bulan, target impianmu akan cepat tercapai!`;
  } else {
    advice = `💡 **Rekomendasi AI:** Kamu mengalokasikan **${formatRupiah(savingAmt)}** untuk tabungan masa depan. Coba tingkatkan persentase tabungan secara bertahap hingga minimal 20% agar keuanganmu semakin mandiri.`;
  }

  aiContainer.innerHTML = `<p>${advice.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}</p>`;
}

// Logika Tambah Transaksi (Pemasukan & Pengeluaran)
document.getElementById('transaction-form').addEventListener('submit', function (e) {
  e.preventDefault();

  const dateInput = document.getElementById('trx-date').value;
  const actionInput = document.getElementById('trx-action').value; // 'in' atau 'out'
  const typeInput = document.getElementById('trx-type').value;     // 'jajan', 'tabungan', 'darurat'
  const descInput = document.getElementById('trx-desc').value.trim();
  const amountInput = parseFloat(document.getElementById('trx-amount').value) || 0;

  if (!dateInput || !descInput || amountInput <= 0) {
    alert("Mohon lengkapi data transaksi dengan benar!");
    return;
  }

  // Cek jika pengeluaran melebihi saldo yang ada
  if (actionInput === 'out') {
    if (typeInput === 'jajan' && amountInput > totalSaldoJajan) {
      alert("⚠️ Sisa Saldo Jajan tidak cukup untuk pengeluaran ini!");
      return;
    } else if (typeInput === 'tabungan' && amountInput > totalSaldoTabungan) {
      alert("⚠️ Saldo Tabungan tidak cukup!");
      return;
    } else if (typeInput === 'darurat' && amountInput > totalSaldoDarurat) {
      alert("⚠️ Saldo Dana Darurat tidak cukup!");
      return;
    }
  }

  // Format tanggal menjadi DD/MM/YY
  const dateObj = new Date(dateInput);
  const formattedDate = `${String(dateObj.getDate()).padStart(2, '0')}/${String(dateObj.getMonth() + 1).padStart(2, '0')}/${String(dateObj.getFullYear()).slice(-2)}`;

  // Hitung penambahan atau pengurangan saldo
  const multiplier = (actionInput === 'in') ? 1 : -1;

  if (typeInput === 'tabungan') {
    totalSaldoTabungan += amountInput * multiplier;
  } else if (typeInput === 'darurat') {
    totalSaldoDarurat += amountInput * multiplier;
  } else if (typeInput === 'jajan') {
    totalSaldoJajan += amountInput * multiplier;
  }

  // Simpan ke riwayat transaksi
  const newTrx = {
    date: formattedDate,
    action: actionInput,
    type: typeInput,
    desc: descInput,
    amount: amountInput
  };
  transactions.unshift(newTrx); // Tambah di paling atas

  // Update Tampilan DOM Saldo & Tabel
  updateWalletDisplay();
  renderTransactionTable();

  // Reset form deskripsi & nominal
  document.getElementById('trx-desc').value = '';
  document.getElementById('trx-amount').value = '';
});

// Fungsi Update Tampilan Saldo Dompet
function updateWalletDisplay() {
  document.getElementById('saldo-tabungan').innerText = formatRupiah(totalSaldoTabungan);
  document.getElementById('saldo-darurat').innerText = formatRupiah(totalSaldoDarurat);
  document.getElementById('saldo-jajan').innerText = formatRupiah(totalSaldoJajan);
}

// Fungsi Render Tabel Riwayat Transaksi
function renderTransactionTable() {
  const tbody = document.getElementById('transaction-list');
  tbody.innerHTML = '';

  if (transactions.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" class="empty-table">Belum ada transaksi tercatat.</td></tr>`;
    return;
  }

  transactions.forEach(trx => {
    const tr = document.createElement('tr');
    
    // Label Kategori
    let categoryName = '';
    if (trx.type === 'tabungan') categoryName = 'Tabungan Masa Depan';
    else if (trx.type === 'darurat') categoryName = 'Dana Darurat';
    else categoryName = 'Uang Jajan';

    // Badge Jenis Transaksi & Warna Nominal
    const isIncome = trx.action === 'in';
    const actionBadge = isIncome 
      ? `<span class="badge-in">➕ Setor</span>` 
      : `<span class="badge-out">➖ Pengeluaran</span>`;
    
    const amountClass = isIncome ? 'text-success' : 'text-danger';
    const amountSign = isIncome ? '+' : '-';

    tr.innerHTML = `
      <td>${trx.date}</td>
      <td>${actionBadge}</td>
      <td><strong>${categoryName}</strong></td>
      <td>${trx.desc}</td>
      <td class="${amountClass}">${amountSign} ${formatRupiah(trx.amount)}</td>
    `;
    tbody.appendChild(tr);
  });
}

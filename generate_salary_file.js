#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// ========== 設定區 ==========
// 修改以下變數以符合你的環境
let CSV_FILE = './here.csv'; // CSV 檔案路徑，相對或絕對路徑
let UNIT_CODE = '0000000'; // 委託單位代號（7 碼，需自行設定）
let OUTPUT_DIR = './'; // 輸出目錄，預設為當前目錄
let CUSTOM_DATE = null; // 自訂發薪日期（民國年月日），格式: 1141210

// 解析命令列參數
const args = process.argv.slice(2);
for (let i = 0; i < args.length; i++) {
  switch (args[i]) {
    case '--csv':
      CSV_FILE = args[i + 1];
      i++;
      break;
    case '--code':
      UNIT_CODE = args[i + 1];
      i++;
      break;
    case '--output':
      OUTPUT_DIR = args[i + 1];
      i++;
      break;
    case '--date':
      CUSTOM_DATE = args[i + 1]; // 格式: 1141210
      i++;
      break;
    case '--help':
      console.log(`
富邦銀行薪資轉帳檔案生成器 v1.1

使用方法:
  node generate_salary_file.js [選項]

選項:
  --csv <路徑>      CSV 檔案路徑 (默認: ./here.csv)
  --code <代號>     委託單位代號，7 碼 (無默認，必須設定)
  --output <路徑>   輸出目錄 (默認: ./)
  --date <日期>     發薪日期，民國年月日，7 碼 (默認: 使用當前日期)
  --help           顯示此說明

範例:
  node generate_salary_file.js --code 6711898
  node generate_salary_file.js --csv ./data.csv --code 1234567
  node generate_salary_file.js --code 6711898 --date 1141215
      `);
      process.exit(0);
  }
}

// 簡單的 CSV 解析函數
function parseCSV(csvData) {
  const lines = csvData.trim().split('\n');
  const headers = lines[0].split(',').map(h => h.trim());

  const records = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const values = [];
    let current = '';
    let inQuotes = false;

    for (let j = 0; j < line.length; j++) {
      const char = line[j];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        values.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    values.push(current.trim());

    const record = {};
    headers.forEach((header, idx) => {
      record[header] = values[idx] || '';
    });
    records.push(record);
  }

  return records;
}

// 讀取 CSV 檔案
const csvData = fs.readFileSync(CSV_FILE, 'utf-8');
const records = parseCSV(csvData);

// 過濾並處理員工數據（排除合計行）
const employees = records.filter(record => {
  const no = record.NO ? record.NO.trim() : '';
  return no && no !== '合計' && !isNaN(parseInt(no));
}).map(record => ({
  name: record.姓名 ? record.姓名.trim() : '',
  salary: parseInt((record.應付薪資 || '').replace(/[,\s]/g, '')),
  idNumber: record.身分證號 ? record.身分證號.trim() : '',
  accountNumber: record.帳號 ? record.帳號.trim() : ''
}));

// 檢查是否找到員工
if (employees.length === 0) {
  console.error('\n❌ 錯誤: 找不到任何員工記錄');
  console.error('請檢查 CSV 檔案格式是否正確');
  process.exit(1);
}

console.log(`✅ 找到 ${employees.length} 位員工`);
employees.forEach((emp, idx) => {
  console.log(`   ${idx + 1}. ${emp.name} - 薪資: $${emp.salary.toLocaleString()}`);
});

// 獲取發薪日期
let dateStr;
if (CUSTOM_DATE) {
  // 驗證自訂日期格式
  if (!/^\d{7}$/.test(CUSTOM_DATE)) {
    console.error('\n❌ 錯誤: 日期格式不正確');
    console.error('日期應為 7 碼民國年月日 (例如: 1141210)');
    process.exit(1);
  }
  dateStr = CUSTOM_DATE;
  const rocYear = CUSTOM_DATE.substring(0, 3);
  const month = CUSTOM_DATE.substring(3, 5);
  const day = CUSTOM_DATE.substring(5, 7);
  console.log(`\n📅 發薪日期: ${rocYear}年${month}月${day}日 (自訂)`);
} else {
  // 使用當前日期
  const today = new Date();
  const rocYear = today.getFullYear() - 1911;
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  dateStr = String(rocYear).padStart(3, '0') + month + day;
  console.log(`\n📅 發薪日期: ${rocYear}年${month}月${day}日`);
}

// 驗證委託單位代號
if (!/^\d{7}$/.test(UNIT_CODE)) {
  console.error('❌ 錯誤: 委託單位代號必須是 7 碼數字');
  console.error(`收到: ${UNIT_CODE}`);
  process.exit(1);
}
console.log(`🏦 委託單位代號: ${UNIT_CODE}`);

// 計算薪資總額
const totalSalary = employees.reduce((sum, emp) => sum + emp.salary, 0);
const totalSalaryStr = String(Math.round(totalSalary * 100)).padStart(13, '0');

console.log(`薪資總額: ${totalSalary}`);

// 生成 txt 內容
let txtContent = `K${UNIT_CODE}00000************${dateStr}${totalSalaryStr}\n`;

employees.forEach(employee => {
  const accountNumberDigitsOnly = String(employee.accountNumber).replace(/\D/g, '');
  const accountNumber = accountNumberDigitsOnly.padStart(14, '0');
  const salary = String(Math.round(employee.salary * 100)).padStart(13, '0');
  const idNumber = employee.idNumber.toUpperCase().padEnd(10, ' ').substring(0, 10);

  txtContent += `C${UNIT_CODE}00000${accountNumber}000000${salary}${idNumber}\n`;
});

// 生成檔案名稱
const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
const filename = `salary_${dateStr}_${timestamp}.txt`;
const outputPath = path.join(OUTPUT_DIR, filename);

// 寫入檔案
fs.writeFileSync(outputPath, txtContent, 'utf-8');

console.log(`\n✅ 檔案已生成: ${outputPath}`);
console.log(`\n檔案內容預覽:`);
console.log(txtContent);

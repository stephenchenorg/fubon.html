# How to Auto-Populate the Salary Form

This guide shows you how to automatically fill in the employee salary data from your spreadsheet into the web form.

## Method 1: Using Browser Console (Recommended)

1. Open `index.html` in your web browser
2. Open the browser's Developer Console:
   - **Chrome/Edge**: Press `F12` or `Cmd+Option+J` (Mac) / `Ctrl+Shift+J` (Windows)
   - **Firefox**: Press `F12` or `Cmd+Option+K` (Mac) / `Ctrl+Shift+K` (Windows)
   - **Safari**: Enable Developer menu in Preferences, then press `Cmd+Option+C`

3. Copy all the code from `populate_data.js`

4. Paste the code into the console and press Enter

5. The form will automatically populate with all 7 employees:
   - 陳淑綺 - $34,000
   - 陳煜萱 - $50,000
   - 趙怡茜 - $33,000
   - 簡詩容 - $60,000
   - 林瑞鴻 - $60,000
   - 程詠琪 - $42,000
   - 陳立昇 - $34,000

6. Verify the data and click "下載 txt 檔案" to generate the file

## Method 2: Add Script Directly to HTML (Alternative)

If you want the data to auto-populate every time you open the page:

1. Open `index.html` in a text editor
2. Find the line `}).mount('#app');` near the end of the file
3. Add the employee population code right after the mount line
4. Save and reload the page

## Data Populated

The script will fill in the following fields for each employee:

- **Account Number** (帳號): Employee's bank account number
- **Salary** (薪資): Monthly salary amount
- **ID Number** (身份證字號): National ID number
- **Note** (備註): Employee name for reference

## Note

The total in the original image is 315,714, which includes additional payments (應付薪資 column). The base salaries total 313,000. Make sure to verify the amounts match your needs before downloading the file.

## Troubleshooting

If the script doesn't work:
- Make sure you're on the salary input page (index.html)
- Ensure the page has fully loaded before running the script
- Check that there are no JavaScript errors in the console
- Try refreshing the page and running the script again

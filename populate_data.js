// Paste this code into the browser console on the salary input page to auto-populate the form

// ========== 設定區 ==========
// 在下方編輯員工資料，然後執行此腳本
const employeeData = [
  {
    name: '員工1',
    salary: '34000',
    idNumber: 'A123456789',
    accountNumber: '1234-5678-9012',
    note: '員工1'
  },
  {
    name: '員工2',
    salary: '50000',
    idNumber: 'B234567890',
    accountNumber: '2345-6789-0123',
    note: '員工2'
  },
  {
    name: '員工3',
    salary: '33000',
    idNumber: 'C345678901',
    accountNumber: '3456-7890-1234',
    note: '員工3'
  }
  // 在上方添加更多員工...
];

// Function to populate the form
function populateForm() {
  // Get the Vue app instance - try multiple methods for Vue 3
  const appElement = document.querySelector('#app');

  if (!appElement) {
    console.error('Could not find #app element. Make sure the page is loaded.');
    return;
  }

  // Access Vue instance through the element's __vueApp property
  let vm = null;

  // Try different Vue 3 access patterns
  if (appElement.__vueApp) {
    const app = appElement.__vueApp;
    vm = app._instance?.proxy || app._component?.proxy;
  }

  // Alternative: try to get from __vue_app__ property
  if (!vm && appElement.__vue_app__) {
    const app = appElement.__vue_app__;
    vm = app._instance?.proxy || app._component?.proxy;
  }

  // Last resort: search for Vue instance on child elements
  if (!vm) {
    const allElements = appElement.querySelectorAll('*');
    for (let el of allElements) {
      if (el.__vueParentComponent) {
        vm = el.__vueParentComponent.proxy;
        break;
      }
    }
  }

  if (!vm) {
    console.error('Could not access Vue instance. Trying alternative method...');

    // Alternative: Use the global Vue instance if available
    if (typeof Vue !== 'undefined') {
      console.log('Using alternative populate method via DOM manipulation');
      populateViaDOM();
      return;
    }

    console.error('All methods failed. Please make sure Vue app is properly loaded.');
    return;
  }

  console.log('Vue instance found! Starting population...');

  // Clear existing employees
  vm.employees = [];

  // Add each employee
  employeeData.forEach((emp, index) => {
    setTimeout(() => {
      vm.addEmployee();
      const lastIndex = vm.employees.length - 1;
      const employee = vm.employees[lastIndex];

      employee.accountNumber = emp.accountNumber;
      employee.salary = emp.salary;
      employee.idNumber = emp.idNumber;
      employee.note = emp.note;

      console.log(`Added employee ${index + 1}: ${emp.name}`);
    }, index * 100); // Stagger the additions slightly
  });

  console.log('All employees will be added!');
  console.log('Total salary: 313,000');
}

// Alternative method: populate by clicking and filling via DOM
function populateViaDOM() {
  console.log('Using DOM manipulation method...');

  const addButton = Array.from(document.querySelectorAll('button'))
    .find(btn => btn.textContent.includes('新增員工'));

  if (!addButton) {
    console.error('Could not find the "新增員工" button');
    return;
  }

  employeeData.forEach((emp, index) => {
    setTimeout(() => {
      // Click add employee button
      addButton.click();

      setTimeout(() => {
        // Get all employee sections
        const employeeSections = document.querySelectorAll('[class*="border-gray-200"]');
        const currentSection = employeeSections[employeeSections.length - 1];

        if (currentSection) {
          const inputs = currentSection.querySelectorAll('input');
          if (inputs.length >= 4) {
            // Fill in the data
            inputs[0].value = emp.accountNumber;
            inputs[0].dispatchEvent(new Event('input', { bubbles: true }));

            inputs[1].value = emp.salary;
            inputs[1].dispatchEvent(new Event('input', { bubbles: true }));

            inputs[2].value = emp.idNumber;
            inputs[2].dispatchEvent(new Event('input', { bubbles: true }));

            inputs[3].value = emp.note;
            inputs[3].dispatchEvent(new Event('input', { bubbles: true }));

            console.log(`Added employee ${index + 1}: ${emp.name}`);
          }
        }
      }, 100);
    }, index * 300);
  });

  console.log('Population started via DOM method!');
}

// Run the population function
populateForm();

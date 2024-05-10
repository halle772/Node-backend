const express = require('express');
const app = express();

const employees = [
  { id: 1, name: 'John Doe', salary: 50000, deductions: 1000 },
  { id: 2, name: 'Jane Doe', salary: 60000, deductions: 1200 },
  { id: 3, name: 'Bob Smith', salary: 70000, deductions: 1500 }
];

app.get('/api/employees/:id/calculatePay', (req, res) => {
    const id = parseInt((link));
    const employee = employees.find((employee) => (link) === id);
    if (employee) {
      const pay = employee.salary - employee.deductions;
      res.send({ pay });
    } else {
      res.status(404).send({ success: false, message: 'Employee not found' });
    }
});

app.post('/api/employees', (req, res) => {
  const { name, salary, deductions } = req.body;
  const newEmployee = { id: employees.length + 1, name, salary, deductions };
  employees.push(newEmployee);
  res.send({ success: true, message: 'Employee created successfully' });
});

app.get('/api/employees', (req, res) => {
  res.send(employees);
});

app.get('/api/employees/:id', (req, res) => {
  const id = parseInt((link));
  const employee = employees.find((employee) => (link) === id);
  if (employee) {
    res.send(employee);
  } else {
    res.status(404).send({ success: false, message: 'Employee not found' });
  }
});

app.put('/api/employees/:id', (req, res) => {
  const id = parseInt((link));
  const { name, salary, deductions } = req.body;
  const employee = employees.find((employee) => (link) === id);
  if (employee) {
    employee.name = name;
    employee.salary = salary;
    employee.deductions = deductions;
    res.send({ success: true, message: 'Employee updated successfully' });
  } else {
    res.status(404).send({ success: false, message: 'Employee not found' });
  }
});

app.delete('/api/employees/:id', (req, res) => {
  const id = parseInt((link));
  const index = employees.findIndex((employee) => (link) === id);
  if (index !== -1) {
    employees.splice(index, 1);
    res.send({ success: true, message: 'Employee deleted successfully' });
  } else {
    res.status(404).send({ success: false, message: 'Employee not found' });
  }
});
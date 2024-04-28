
const express = require('express');
const bodyParser = require('body-parser');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(bodyParser.json()); // Parses JSON requests

// Endpoint to receive invoice data and generate a PDF
app.post('/generate-invoice', (req, res) => {
  const { date, clientName, clientAddress, products } = req.body;

  // Create a PDF document
  const doc = new PDFDocument();
  const buffers = [];

  doc.on('data', (chunk) => buffers.push(chunk));
  doc.on('end', () => {
    const pdfData = Buffer.concat(buffers);
    res.setHeader('Content-Disposition', 'attachment; filename=invoice.pdf');
    res.setHeader('Content-Type', 'application/pdf');
    res.send(pdfData);
  });

  // Create invoice content
  doc.fontSize(20).text('Invoice', { align: 'center' });
  doc.moveDown();
  doc.fontSize(12).text(`Date: ${date}`);
  doc.text(`Client: ${clientName}`);
  doc.text(`Address: ${clientAddress}`);
  doc.moveDown();
  doc.fontSize(14).text('Products/Services:');

  products.forEach((product, index) => {
    const { description, quantity, price } = product;
    const total = quantity * price;
    doc.text(
      `${index + 1}. ${description} - ${quantity} x $${price.toFixed(2)} = $${total.toFixed(2)}`
    );
  });

  // Calculate total amount
  const totalAmount = products.reduce((sum, product) => sum + product.quantity * product.price, 0);
  doc.moveDown();
  doc.fontSize(14).text(`Total: $${totalAmount.toFixed(2)}`);

  // End the document
  doc.end();
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});


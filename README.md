Hotel Management System

A full-stack web application for managing hotel operations — room reservations, cancellations, and customer records — built as a college project.

About

This project was developed as part of a college submission ("HOTEL MANAGEMENT" report) by Shivesh Naik and Swayam Virdiker, Don Bosco College of Engineering, Fatorda, Margao, Goa.

Features
Browse available rooms and hotel information
Book a reservation with automatic GST (18%) calculation on the total
Cancel a reservation using name + confirmation number, with refund calculated after a 10% deduction
View customer details and booking records
Simple, interactive front-end connected to a backend API
Tech Stack

Frontend

HTML — structure (index.html)
CSS — styling (style.css)
JavaScript — client-side logic and API calls (script.js)

Backend

Node.js — server (server.js)
JSON file storage (db.json)
Project Structure
hotel-management-system/
├── public/
│   ├── index.html
│   ├── script.js
│   └── style.css
├── server.js
├── db.json
├── package.json
└── package-lock.json
Getting Started
Prerequisites
Node.js installed on your machine
Installation
Clone the repository
bash
   git clone https://github.com/swayamvirdiker-2510/hotel-management-system.git
   cd hotel-management-system
Install dependencies
bash
   npm install
Start the server
bash
   node server.js
Open your browser and navigate to http://localhost:<PORT> (check server.js for the port number), or open public/index.html directly if the frontend is served statically.
API Overview
Endpoint	Method	Description
/api/reservations	POST	Create a new reservation
/api/reservations/cancel	POST	Cancel a reservation and calculate refund
/api/customers	GET	Fetch customer details

(Update this table with any additional endpoints as the backend grows.)

Future Improvements
Add authentication for admin/staff access
Persist data with a real database instead of a JSON file
Add room availability calendar view
Authors
Swayam Virdiker
Shivesh Naik

Don Bosco College of Engineering, Fatorda, Margao, Goa

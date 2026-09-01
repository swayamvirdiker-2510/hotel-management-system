let customers = [];
let rooms = [];
let confirmationCounter = 1000;

function initializeRooms() {
  rooms = [];
  for (let i = 1; i <= 20; i++) {
    rooms.push({ number: 1000 + i, type: "Single", rate: 900, available: true });
    rooms.push({ number: 2000 + i, type: "Double", rate: 1500, available: true });
    rooms.push({ number: 3000 + i, type: "Suite", rate: 2000, available: true });
  }
  for (let i = 1; i <= 10; i++) {
    rooms.push({ number: 4000 + i, type: "VIP", rate: 5000, available: true });
  }
}

initializeRooms();

function showAvailableRooms() {
  const types = {
    Single: 900,
    Double: 1500,
    Suite: 2000,
    VIP: 5000
  };
  let output = "<h3>Available Room Categories</h3><ul>";
  for (let type in types) {
    output += `<li>${type} Room - Rate: ₹${types[type]}</li>`;
  }
  output += "</ul>";
  document.getElementById("outputArea").innerHTML = output;
}

function showAddCustomer() {
  let name = prompt("Enter customer name:");
  let contact = prompt("Enter contact details:");
  if (name && contact) {
    customers.push({ name, contact, roomsBooked: [], confirmationNumber: null });
    alert("Customer added successfully.");
  }
}

function showReservation() {
  let name = prompt("Enter your name:");
  let customer = customers.find(c => c.name === name);
  if (!customer) return alert("Customer not found. Please add customer first.");

  if (customer.confirmationNumber) {
    let enteredConf = prompt("Enter your confirmation number:");
    if (parseInt(enteredConf) !== customer.confirmationNumber) return alert("Invalid confirmation number.");
    return alert("You already have a reservation.");
  }

  let type = prompt("Enter room type (Single, Double, Suite, VIP):");
  let availableRooms = rooms.filter(r => r.type === type && r.available);
  if (availableRooms.length === 0) return alert("No rooms available in this category.");

  let numRooms = parseInt(prompt("Enter number of rooms to book:"));
  let numDays = parseInt(prompt("Enter number of days to stay:"));
  let bookedRooms = [];

  for (let i = 0; i < numRooms; i++) {
    let roomList = availableRooms.map(r => r.number).join(", ");
    let roomNum = parseInt(prompt(`Enter room number from available list:\n${roomList}`));
    let room = availableRooms.find(r => r.number === roomNum);
    if (room) {
      room.available = false;
      bookedRooms.push(roomNum);
      availableRooms = availableRooms.filter(r => r.number !== roomNum); // remove selected room from list
    } else {
      alert("Invalid room number.");
      return;
    }
  }

  let total = bookedRooms.reduce((sum, roomNum) => {
    let room = rooms.find(r => r.number === roomNum);
    return sum + (room.rate * numDays);
  }, 0);

  let gst = total * 0.18;
  let final = total + gst;

  customer.roomsBooked = bookedRooms;
  customer.confirmationNumber = confirmationCounter++;

  alert(`Booking successful! Confirmation Number: ${customer.confirmationNumber}\nTotal (with 18% GST): ₹${final.toFixed(2)}`);
}

function showCancelReservation() {
  let name = prompt("Enter your name:");
  let customer = customers.find(c => c.name === name);
  if (!customer || !customer.confirmationNumber) return alert("Reservation not found.");

  let confNum = prompt("Enter your confirmation number:");
  if (parseInt(confNum) !== customer.confirmationNumber) return alert("Invalid confirmation number.");

  customer.roomsBooked.forEach(roomNum => {
    let room = rooms.find(r => r.number === roomNum);
    if (room) room.available = true;
  });

  let refund = customer.roomsBooked.reduce((sum, roomNum) => {
    let room = rooms.find(r => r.number === roomNum);
    return sum + room.rate;
  }, 0) * 0.90; // 10% deduction

  customer.roomsBooked = [];
  customer.confirmationNumber = null;

  alert(`Reservation cancelled. Refund (after 10% deduction): ₹${refund.toFixed(2)}`);
}

function showCustomerDetails() {
  let output = "<h3>Customer Details</h3>";
  if (customers.length === 0) {
    output += "<p>No customers added.</p>";
  } else {
    customers.forEach(c => {
      output += `<p><strong>Name:</strong> ${c.name}<br/>
      <strong>Contact:</strong> ${c.contact}<br/>
      <strong>Rooms Booked:</strong> ${c.roomsBooked.join(", ") || "None"}<br/>
      <strong>Confirmation Number:</strong> ${c.confirmationNumber || "None"}</p><hr/>`;
    });
  }
  document.getElementById("outputArea").innerHTML = output;
}

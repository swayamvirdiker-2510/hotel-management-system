const API = ""; // same origin

async function showAvailableRooms() {
  const res = await fetch(`${API}/api/rooms/categories`);
  const types = await res.json();
  let output = "<h3>Available Room Categories</h3><ul>";
  for (let type in types) {
    output += `<li>${type} Room - Rate: ₹${types[type]}</li>`;
  }
  output += "</ul>";
  document.getElementById("outputArea").innerHTML = output;
}

async function handleAddCustomer() {
  let name = prompt("Enter customer name:");
  let contact = prompt("Enter contact details:");
  if (!name || !contact) return;

  const res = await fetch(`${API}/api/customers`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, contact })
  });
  const data = await res.json();

  if (!res.ok) return alert(data.error || "Could not add customer.");
  alert("Customer added successfully.");
}

async function handleReservation() {
  let name = prompt("Enter your name:");
  if (!name) return;

  let type = prompt("Enter room type (Single, Double, Suite, VIP):");
  if (!type) return;

  const roomsRes = await fetch(`${API}/api/rooms?type=${encodeURIComponent(type)}`);
  const roomsOfType = await roomsRes.json();
  let available = roomsOfType.filter(r => r.available);

  if (available.length === 0) return alert("No rooms available in this category.");

  let numRooms = parseInt(prompt("Enter number of rooms to book:"));
  let numDays = parseInt(prompt("Enter number of days to stay:"));
  if (!Number.isInteger(numRooms) || numRooms <= 0) return alert("Invalid number of rooms.");
  if (!Number.isInteger(numDays) || numDays <= 0) return alert("Invalid number of days.");

  let chosenNumbers = [];
  for (let i = 0; i < numRooms; i++) {
    let roomList = available.map(r => r.number).join(", ");
    let roomNum = parseInt(prompt(`Enter room number from available list:\n${roomList}`));
    let room = available.find(r => r.number === roomNum);
    if (!room) return alert("Invalid room number.");
    chosenNumbers.push(roomNum);
    available = available.filter(r => r.number !== roomNum);
  }

  const res = await fetch(`${API}/api/reservations`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, type, roomNumbers: chosenNumbers, numDays })
  });
  const data = await res.json();

  if (!res.ok) return alert(data.error || "Reservation failed.");
  alert(`Booking successful! Confirmation Number: ${data.confirmationNumber}\nTotal (with 18% GST): ₹${data.total}`);
}

async function handleCancelReservation() {
  let name = prompt("Enter your name:");
  if (!name) return;
  let confNum = parseInt(prompt("Enter your confirmation number:"));

  const res = await fetch(`${API}/api/reservations/cancel`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, confirmationNumber: confNum })
  });
  const data = await res.json();

  if (!res.ok) return alert(data.error || "Cancellation failed.");
  alert(`Reservation cancelled. Refund (after 10% deduction): ₹${data.refund}`);
}

async function showCustomerDetails() {
  const res = await fetch(`${API}/api/customers`);
  const customers = await res.json();

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

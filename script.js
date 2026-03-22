const shopContainer = document.getElementById("shop-items");
const itemsContainer = document.getElementById("item-list");
let itemsOwned = JSON.parse(localStorage.getItem("itemsOwned")) || [];
const shopItems = [
  {
    name: "robot",
    description: "Robots help you manufacture more RAM!",
    cost: 10,
    startingCost: 10,
  },
  {
    name: "assembly-line",
    description: "Improves the efficiency of RAM manufacturing.",
    cost: 50,
    startingCost: 50,
  },
  {
    name: "new-fab",
    description: "Large investment, double or nothing!",
    cost: 1000,
    startingCost: 1000,
  }
];
const button = document.getElementById("click-button");
const count = document.getElementById("click-count");
let highest = localStorage.getItem("highest") || 0;
let lifetime = localStorage.getItem("lifetime") || 0;
let totalClickCount = parseInt(localStorage.getItem("totalClickCount")) || 0;

function buttonClick() {
  console.log("Button was clicked!");

  const multiplierOwned = itemsOwned.find((i) => i.name === "assembly-line");
  const multiplierCount = multiplierOwned ? multiplierOwned.amount : 0;

  totalClickCount = totalClickCount + 1 * 2 ** multiplierCount;

  count.textContent = totalClickCount;
  localStorage.setItem("totalClickCount", totalClickCount);
  if (totalClickCount > highest) {
    highest = totalClickCount;
  }
  lifetime++;
  updateStats();
}

// Main click handler
button.addEventListener("click", function () {
  buttonClick();
});

function createShopItems() {
  // remove all items already in the shop
  document.querySelectorAll(".shop-item").forEach((element) => {
    element.remove();
  });

  // add new items
  shopItems.forEach((item) => {
    const shopItem = document.createElement("div");
    shopItem.className = "shop-item";

    shopItem.innerHTML = `
      <div>
        <h3>${item.name}</h3>
        <p>${item.description}</p>
      </div>
      <button onclick="buyItem('${item.name}')">
        Buy for ${item.cost}MB
      </button>
    `;

    shopContainer.appendChild(shopItem);
  });
}

function buyItem(itemName) {
  const item = shopItems.find((i) => i.name === itemName);
  if (totalClickCount >= item.cost) {
    totalClickCount -= item.cost;
    count.textContent = totalClickCount;

    let amount = 1;

    // check if we already own item, if we do then ++ it, else add it
    const itemInArray = itemsOwned.find((obj) => obj.name === item.name);
    if (item.name === "new-fab") {
      // 50% chance to double your money, 50% chance to lose it all
      if (Math.random() < 0.5) {
        totalClickCount += item.cost * 2 - 1;
        buttonClick();
        count.textContent = totalClickCount;
        window.alert(`Congratulations! Your new fab was a success! You earned ${item.cost * 2}MB.`);
      } else {
        window.alert(`Oh no! Your new fab was a failure! You lost your investment of ${item.cost}MB.`);
      }
      updateStats();
      return;
    }
    if (itemInArray) {
      itemInArray.amount++;
      console.log(`Found ${item.name}, added 1!`);
      amount = itemInArray.amount;
    } else {
      itemsOwned.push({ name: item.name, amount: 1 });
      console.log(`Added ${item.name} to itemsOwned!`);
    }

    // make the item cost more each time you buy it
    item.cost = item.startingCost + item.startingCost * amount ** 2;
    createShopItems(); // redraw the shop with new prices

    console.log(`Bought ${itemName}!`);
  } else {
    console.log(`Not enough RAM! Need ${item.cost}MB`);
    window.alert(`Not enough RAM! You need ${item.cost}MB to buy ${itemName}.`);
  }
  updateStats();
}

setInterval(() => {
  // For every robot we own, we need to click the button
  const robotOwned = itemsOwned.find((i) => i.name === "robot");
  if (robotOwned) {
    // If you own robots
    for (let i = 0; i < robotOwned.amount; i++) {
      buttonClick();
    }
  }
}, 1000);

function updateStats() {
  localStorage.setItem("itemsOwned", JSON.stringify(itemsOwned));
  localStorage.setItem("highest", highest);
  localStorage.setItem("lifetime", lifetime);

  document.querySelector("#highest").textContent = localStorage.getItem("highest") || 0;
  document.querySelector("#lifetime").textContent = localStorage.getItem("lifetime") || 0;
  if (itemsOwned.length > 0) {
    for (let item of itemsOwned) {
      let exists = !!document.querySelector(`.${item.name}`);
    if (!exists) {
      const itemEl = document.createElement("li");
      itemEl.className = item.name;
      itemEl.textContent = item.name;
      itemsContainer.appendChild(itemEl);
    } else {
      const itemEl = document.querySelector(`.${item.name}`);
      itemEl.textContent = `${item.name} x${item.amount}`;
    }
    }
  } else {
    itemsContainer.innerHTML = "<li>No items owned yet!</li>";
  }
}

document.getElementById("reset").addEventListener("click", reset);
function reset() {
  if (window.confirm("Are you sure you want to reset your progress?")) {
    localStorage.clear();
    itemsOwned = [];
    totalClickCount = 0;
    highest = 0;
    lifetime = 0;
    count.textContent = totalClickCount;
    createShopItems();
    updateStats();
  }
}

createShopItems();
updateStats();

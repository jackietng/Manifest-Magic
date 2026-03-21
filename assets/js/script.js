// === DOM ELEMENTS ===
const moodBoardEl = document.querySelector('#mood-board'); // This is the code "grabbing" the buttons and input fields from HTML so JavaScript can interact with them. 
const addImageBtn = document.querySelector('#add-image');
const imageUrlInput = document.querySelector('#image-url');
const addTextBtn = document.querySelector('#add-text');
const textInput = document.querySelector('#text-input');
const clearBtn = document.querySelector('#clear-all');

// === STATE ===
// This is the app's "memory" while it is running - tracking what's on the board and what's currently being dragged. 
let moodBoardItems = {
  images: [],
  texts: [],
};
let offsetX = 0;
let offsetY = 0;
// We neet to keep track of the current element that is being dragged
let currentElement = null;

clearBtn.addEventListener('click', function () {
  // Clear the local storage and refresh the page
  localStorage.clear();
  location.reload();
});

// === UTILITY FUNCTIONS ===
function updateLocalStorageItems(items) {
  // Update the local storage with the moodBoardItems
  localStorage.setItem('moodBoardItems', JSON.stringify(items));
}

// Function to load from local storage. This function will be called on page load.
function loadFromLocalStorage() {
  // Load and parse the data from local storage and paint the images and text on the mood board
  const boardItems = JSON.parse(localStorage.getItem('moodBoardItems')) || [];
  boardItems.forEach((item, index) => {
    if (item.type === 'image') {
      createImageElement(item.url, item.left, item.top, index);
    } else if (item.type === 'text') {
      createTextElement(item.text, item.left, item.top, index);
    }
  });
  }


// === CREATOR FUNCTIONS ===
// These functions will create the image and text elements and append them to the mood board.
// Paint the stored images on mood board
function createImageElement(url, left, top, index) {
  const img = document.createElement('img');
  img.src = url; // Set the image source to the stored URL
  img.style.position = 'absolute'; // Ensure the image is positioned absolutely
  img.style.left = left;
  img.style.top = top;
  img.classList.add('draggable');
  img.style.cursor = 'grab'; // Change cursor to grabbing when hovering over the image
  moodBoardEl.appendChild(img);
  makeElementDraggable(img, index); // Make the image draggable
};

// Paint the stored text to the mood board
function createTextElement(text, left, top, index) {
  const div = document.createElement('div');
  div.textContent = text; 
  div.style.position = 'absolute'; // Ensure the text is positioned absolutely
  div.style.left = left;
  div.style.top = top;
  div.classList.add('draggable'); // Add classes for styling and dragging
  moodBoardEl.appendChild(div); 
  makeElementDraggable(div, index); // Make the text draggable
};


// We create an event listener for the image URL input field. This will create an image element and attach it to the mood board with the URL provided by the user.
addImageBtn.addEventListener('click', function () {
  const imageUrl = imageUrlInput.value;
  if (imageUrl) {
    // Create an image element
      const img = document.createElement('img');
      img.src = imageUrl;
      img.style.position = 'absolute'; // Ensure the image is positioned absolutely
      moodBoardEl.appendChild(img);
      makeElementDraggable(img); // Make the image draggable
    
    // Set the `currentElement` to the image element you create.
    currentElement = img; 

    // We set the position of the image to the mouse position when the user clicks on the mood board.
   const rect = currentElement.getBoundingClientRect();
    offsetX = rect.width / 2; // Center the image on the mouse position
    offsetY = rect.height / 2; // Center the image on the mouse position

    // We attach the mouse move event listener to the document and the mood board div so that the element can be dragged anywhere on the screen and dropped only on the mood board div.
    attachMouseListeners();
  }
});

// We create an event listener for the text input field. This will create a div element and attach it to the mood board with the text provided by the user.
addTextBtn.addEventListener('click', function () {
  const text = textInput.value.trim();
  if (text) {
    const div = document.createElement('div');
    div.style.position = 'absolute'; // Ensure the text is positioned absolutely
    div.textContent = text;
    moodBoardEl.appendChild(div);
    makeElementDraggable(div); // Make the text div draggable

    // We set the current element to the text div so that we can update the position of the element when the mouse is moved.
    currentElement = div;

    // We set the position of the text to the mouse position when the user clicks on the mood board.
    const rect = currentElement.getBoundingClientRect();
    offsetX = rect.width / 2; // Center the text on the mouse position
    offsetY = rect.height / 2; // Center the text on the mouse position

    // We attach the mouse move event listener to the document and the click listener to the mood board div so that the element can be dragged anywhere on the screen, but dropped only on the mood board div.
    attachMouseListeners();
  }
});

// === DRAG AND DROP FUNCTIONALITY ===
// This function makes an element draggable by adding the necessary event listeners and styles.
function makeElementDraggable(el, index) {
  let isDragging = false; 
  let offsetX, offsetY; 
  
  el.addEventListener('mousedown', function (e) {
    isDragging = true; // Set dragging to true when mouse is down

    const rect = el.getBoundingClientRect(); // Get the position of the element
    // Calculate the offset of the mouse from the top-left corner of the element
    offsetX = e.pageX - rect.left; 
    offsetY = e.pageY - rect.top;
    el.style.zIndex = 1000; // Bring the element to the front when dragging

    function onMouseMove(e) {
      if (!isDragging) return; // If not dragging, do nothing
      el.style.left = `${e.pageX - offsetX}px`; // Update the position of the element
      el.style.top = `${e.pageY - offsetY}px`;
    }

    function onMouseUp() {
      isDragging = false; 
      el.style.zIndex = ''; // Reset z-index when dragging ends

      // Update localStorage with new position
      const boardItems = JSON.parse(localStorage.getItem('moodBoardItems')) || [];

      if (typeof index === 'number') {
        boardItems[index].left = el.style.left;
        boardItems[index].top = el.style.top;
        localStorage.setItem('moodBoardItems', JSON.stringify(boardItems));
      }
      // Remove the event listeners when mouse is up
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    }

    // Attach the mouse move and mouse up event listeners to the document
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
});
}

function attachMouseListeners() {
  // Attach the mouse move event listener to the document and the click listener to the mood board div so that the element can be dragged anywhere on the screen, but dropped only on the mood board div.
  document.addEventListener('mousemove', mouseMoveHandler);
  moodBoardEl.addEventListener('click', placeElementClickHandler);
}

// This is the event handler for the mouse move event. This will be called whenever the mouse is moved on the screen.
// We check if the current element is set. If it is set, we update the position of the element to the mouse position.
function mouseMoveHandler(event) {
  if (currentElement) {
    currentElement.style.left = (event.clientX - offsetX) + 'px';
    currentElement.style.top = (event.clientY - offsetY) + 'px';
  }
}

// This is the event handler for the click event on the mood board. This will be called whenever the user clicks on the mood board.
// We check if the current element is set. If it is set, we attach the element to the mood board and reset the current element.
// When we click, we find the position of the mouse relative to the mood board and update the position of the element accordingly. to 'place' it on the mood board.
function placeElementClickHandler(event) {
  if (!currentElement) return; // If no current element, do nothing
  
  // getBoundingClientRect() gives the position and size of an element relative to the viewport.
    const moodBoardRect = moodBoardEl.getBoundingClientRect();

    // These values determine where on the mood board the item should be placed
    const left = `${event.clientX - moodBoardRect.left - offsetX}px`;
    const top = `${event.clientY - moodBoardRect.top - offsetY}px`;

    // Set the position of the element based on the calculated position above.
    currentElement.style.left = left;
    currentElement.style.top = top;

    // Load existing items from local storage
    const boardItems = JSON.parse(localStorage.getItem('moodBoardItems')) || [];

    let newItem; 

    // tagName tells us what kind of element it is (e.g., IMG, DIV, P, etc.)
    if (currentElement.tagName === 'IMG') {
      newItem = {
        type: 'image',
        url: currentElement.src,
        left,
        top
      };
    } else {
      newItem = {
        type: 'text',
        text: currentElement.textContent,
        left,
        top
      };
    }

    boardItems.push(newItem); // Add the new item to the board items array
    updateLocalStorageItems(boardItems); // Update local storage with the new boardItems information
    moodBoardEl.appendChild(currentElement); // Append the current element to the mood board
    makeElementDraggable(currentElement, boardItems.length - 1); // Make the current element draggable

    // Reset current element
    currentElement = null;

    // Clear inputs
    imageUrlInput.value = '';
    textInput.value = '';

    // Remove event listeners for mouse move, so that the element is no longer draggable
    document.removeEventListener('mousemove', mouseMoveHandler);
  }

// Load existing data from local storage on page load
window.onload = () => {
  loadFromLocalStorage();
};

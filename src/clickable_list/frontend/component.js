/**
 * Creates a list node (li or ul) based on item properties
 * @param {Object} item - The item data 
 * @param {Array} options - All options array for context
 * @param {number} index - Current item index
 * @param {number} indent - Indentation in pixels
 * @param {string} style - CSS style to apply
 * @returns {HTMLElement} The created DOM node
 */
function createListNode(item, options, index, indent, style) {
  // Determine if this should be a parent node (ul) or leaf node (li)
  const isParentNode = index < options.length - 1 && options[index + 1].level > item.level;
  const node = document.createElement(isParentNode ? "ul" : "li");
  
  // Set properties
  node.id = item.id;
  node.innerHTML = item.name;
  
  // Apply indentation for nested items
  if (item.level > 0) {
    node.style.marginLeft = `${indent}px`;
  }
  
  // Apply custom style if provided
  if (style) {
    node.style.cssText += style;
  }
  
  return node;
}

/**
 * Attaches click handler to a node
 * @param {HTMLElement} node - The DOM node
 * @param {Object} item - The item data to return on click
 */
function attachClickHandler(node, item) {
  node.addEventListener("click", (e) => {
    e.stopPropagation();
    Streamlit.setComponentValue(item);
  });
}

/**
 * Updates the parent stack based on level changes
 * @param {Array} parentStack - Stack of parent elements
 * @param {number} currentLevel - Current level in the hierarchy
 * @param {number} newLevel - New level to navigate to
 * @returns {Object} Updated context { parentStack, currentLevel }
 */
function updateParentStack(parentStack, currentLevel, newLevel) {
  const updatedStack = [...parentStack];
  let updatedLevel = currentLevel;
  
  if (newLevel > currentLevel) {
    // Going deeper in the hierarchy - previous node becomes parent
    const newParent = updatedStack[updatedStack.length - 1].lastChild;
    if (newParent) {
      updatedStack.push(newParent);
    }
  } else if (newLevel < currentLevel) {
    // Moving back up the hierarchy - pop parents from stack
    while (updatedLevel > newLevel && updatedStack.length > 1) {
      updatedStack.pop();
      updatedLevel--;
    }
  } else {
    // Same level, no changes needed
    return { parentStack: updatedStack, currentLevel: updatedLevel };
  }
  
  return { parentStack: updatedStack, currentLevel: newLevel };
}

/**
 * Updates the hierarchy state after adding a node
 * @param {HTMLElement} node - The added node
 * @param {Array} parentStack - Current parent stack
 * @param {number} currentLevel - Current level
 * @param {number} itemLevel - Item's level
 * @returns {Object} Updated state { parentStack, currentLevel }
 */
function updateHierarchyState(node, parentStack, currentLevel, itemLevel) {
  const updatedStack = [...parentStack];
  let updatedLevel = currentLevel;
  
  if (node.nodeName === "UL") {
    updatedStack.push(node);
    updatedLevel = itemLevel + 1;
  } else {
    updatedLevel = itemLevel;
  }
  
  return { parentStack: updatedStack, currentLevel: updatedLevel };
}

/**
 * Renders the clickable list component
 * @param {Object} data - The component data from Streamlit
 */
function renderComponent(data) {
  if (!data || !data.options) return;

  let height = data.options.length * 35;
  const output = document.getElementById("root");
  output.innerHTML = "";
  
  let parentStack = [output];
  let currentLevel = 0;
  
  for (let i = 0; i < data.options.length; i++) {
    const item = data.options[i];
    const level = item.level;
    
    // First update parent stack based on level change
    const stackResult = updateParentStack(parentStack, currentLevel, level);
    parentStack = stackResult.parentStack;
    currentLevel = stackResult.currentLevel;
    
    // Create the appropriate node
    const node = createListNode(item, data.options, i, data.indent, data.style);
    
    // Attach click handler
    attachClickHandler(node, item);
    
    // Append to the current parent in the stack
    parentStack[parentStack.length - 1].appendChild(node);
    
    // Update hierarchy state after adding the node
    const stateResult = updateHierarchyState(node, parentStack, currentLevel, level);
    parentStack = stateResult.parentStack;
    currentLevel = stateResult.currentLevel;
  }
  
  Streamlit.setFrameHeight(height);
}

/**
 * Initialize the component and set up message handler
 */
function initComponent() {
  window.addEventListener("message", (event) => {
    const data = event.data.args;
    if (data) renderComponent(data);
  });

  Streamlit.setComponentReady();
}

// Run initialization
initComponent();

// Export for testing
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
  module.exports = {
    renderComponent,
    createListNode,
    attachClickHandler,
    updateParentStack,
    updateHierarchyState,
    initComponent
  };
}
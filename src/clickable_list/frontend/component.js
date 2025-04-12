// Add state management at the top of the file
// This will persist between re-renders
let collapsedNodes = new Set();

/**
 * Determines if an item is the last child in its level
 * @param {Array} options - The full options array
 * @param {number} index - Current item index
 * @param {number} level - Current item's level
 * @returns {boolean} True if it's the last child at its level
 */
function isLastChild(options, index, level) {
  for (let i = index + 1; i < options.length; i++) {
    if (options[i].level < level) {
      return true; // We've gone back up the hierarchy, so this is the last child
    }
    if (options[i].level === level) {
      return false; // Found another item at the same level
    }
  }
  return true; // Reached the end of the array
}

/**
 * Determines which ancestors of an item are last children
 * @param {Array} options - The full options array
 * @param {number} index - Current item index
 * @returns {Object} Map of levels to boolean (true if ancestor at that level is last child)
 */
function getAncestorMap(options, index) {
  const ancestorMap = {};
  const currentItem = options[index];
  
  // Find all ancestors
  let lastLevel = currentItem.level;
  let ancestorLevel = lastLevel - 1;
  
  // Work backwards through the array to find ancestors
  for (let i = index - 1; i >= 0 && ancestorLevel >= 0; i--) {
    const level = options[i].level;
    
    // If we find an item with a level equal to ancestorLevel, it's an ancestor
    if (level === ancestorLevel) {
      // Check if this ancestor is the last child at its level
      let isLastChild = true;
      for (let j = i + 1; j < options.length; j++) {
        if (options[j].level < level) {
          // We've gone back up the hierarchy
          break;
        }
        if (options[j].level === level && j !== i) {
          // Found another item at the same level
          isLastChild = false;
          break;
        }
      }
      
      // Store in map
      ancestorMap[level] = isLastChild;
      
      // Move up to the next ancestor level
      ancestorLevel--;
    }
  }
  
  return ancestorMap;
}

/**
 * Generates the hierarchy symbol using box-drawing characters
 * @param {Array} options - All options array
 * @param {number} index - Current item index
 * @param {number} level - Current item level
 * @returns {string} The formatted hierarchy symbol
 */
function generateBoxDrawingSymbol(options, index, level) {
  if (level === 0) return "";
  
  const ancestorMap = getAncestorMap(options, index);
  let prefix = "";
  
  // Generate the prefix lines based on ancestors
  for (let l = 1; l < level; l++) {
    // If ancestor at this level is last child, use space, otherwise use vertical line
    prefix += (ancestorMap[l] ? "  " : "│ ");
  }
  
  // Determine if current item is last child
  let isLastChild = true;
  for (let i = index + 1; i < options.length; i++) {
    if (options[i].level < level) {
      // We've gone back up the hierarchy
      break;
    }
    if (options[i].level === level) {
      // Found another item at the same level
      isLastChild = false;
      break;
    }
  }
  
  // Add the connector symbol
  prefix += isLastChild ? "└─ " : "├─ ";
  
  return prefix;
}

/**
 * Creates a list node (li or ul) based on item properties
 * @param {Object} item - The item dictionary 
 * @param {Array} options - All options array for context
 * @param {number} index - Current options index
 * @param {number} indent - Indentation in pixels (not used anymore)
 * @param {string} style - CSS style to apply
 * @returns {HTMLElement} The created DOM node
 */
function createListNode(item, options, index, indent, style) {
  // Determine if this should be a parent node (ul) or leaf node (li)
  const isParentNode = index < options.length - 1 && options[index + 1].level > item.level;
  const node = document.createElement(isParentNode ? "ul" : "li");

  // Add collapsible class if node is a parent node
  if (isParentNode) {
    node.classList.add("collapsible");

    // Check if this node was previously collapsed
    const nodeId = `${item.id || ''}-${item.name || ''}-${item.level}`;
    if (collapsedNodes.has(nodeId)) {
      node.classList.add("collapsed");
    }
  }

  // Set id for the node
  node.id = item.id;

  // Clear any existing content
  node.innerHTML = "";

  // Create container for the node content
  const contentContainer = document.createElement("div");
  contentContainer.style.display = "flex";
  contentContainer.style.alignItems = "center";

  // Generate hierarchy symbol for the item
  const hierarchySymbol = generateBoxDrawingSymbol(options, index, item.level);

  // Create span for hierarchy symbol
  if (hierarchySymbol) {
    const symbolSpan = document.createElement("span");
    symbolSpan.className = "hierarchy-symbol";
    symbolSpan.textContent = hierarchySymbol;
    symbolSpan.style.whiteSpace = "pre"; // Preserve whitespace
    symbolSpan.style.fontFamily = "monospace"; // Use monospace font for symbols

    if (isParentNode) {
      symbolSpan.style.cursor = "pointer";

      // Add click handler for collapsing
      symbolSpan.addEventListener("click", (e) => {
        e.stopPropagation();
        const nodeId = `${item.id || ''}-${item.name || ''}-${item.level}`;

        if (node.classList.contains("collapsed")) {
          // Uncollapse
          node.classList.remove("collapsed");
          collapsedNodes.delete(nodeId);
        } else {
          // Collapse
          node.classList.add("collapsed");
          collapsedNodes.add(nodeId);
        }
      });
    } else {
      symbolSpan.style.pointerEvents = "none";
    }

    contentContainer.appendChild(symbolSpan);
  }

  // Create clickable span for the item name
  const nameSpan = document.createElement("span");
  nameSpan.textContent = item.name;
  nameSpan.classList.add("clickable-text");

  // Attach the click handler to just the name span
  nameSpan.addEventListener("click", (e) => {
    e.stopPropagation();
    const state = {
      ...item,
      collapsedState: Array.from(collapsedNodes),
    };
    Streamlit.setComponentValue(state);
  });

  contentContainer.appendChild(nameSpan);
  node.appendChild(contentContainer);

  // Apply custom style if provided
  if (style) {
    node.style.cssText += style;
  }

  return node;
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
    if (data) {
      // Restore the collapsed state if available
      if (data.collapsedState) {
        collapsedNodes = new Set(data.collapsedState);
      }
      renderComponent(data);
    }
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
